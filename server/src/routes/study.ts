import { Router } from 'express';
import { pool } from '../db/index.js';
import { calculateNextReview } from '../lib/srs.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { notFound, badRequest } from '../lib/responses.js';
import { CardWithWordRow, transformCardWithWordRow, transformCardRow } from '../lib/transformers.js';
import { config } from '../config.js';

export const studyRouter = Router();

studyRouter.use(requireAuth);

// Get due cards
studyRouter.get('/due', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { deckId } = req.query;

  let query = `
    SELECT c.*, w.*,
      c.id as card_id,
      w.id as word_id
    FROM cards c
    JOIN words w ON c.word_id = w.id
    WHERE c.due_date <= NOW() AND c.user_id = $1
  `;

  const params: (number | string)[] = [userId];

  if (deckId) {
    params.push(parseInt(deckId as string));
    query += ` AND c.deck_id = $${params.length}`;
  }

  query += ` ORDER BY c.due_date ASC LIMIT ${config.limits.dueCardsLimit}`;

  const { rows } = await pool.query<CardWithWordRow>(query, params);

  res.json(rows.map(transformCardWithWordRow));
}));

// Submit review
studyRouter.post('/review',
  validateBody('cardId', 'rating'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { cardId, rating } = req.body;

    if (rating < 1 || rating > 4) {
      return badRequest(res, 'Rating must be between 1 and 4');
    }

    const { rows: cardRows } = await pool.query(
      'SELECT * FROM cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    const card = cardRows[0];
    if (!card) {
      return notFound(res, 'Card');
    }

    // Calculate next review using SM-2 algorithm
    const { easeFactor, interval, repetitions } = calculateNextReview(
      card.ease_factor,
      card.interval,
      card.repetitions,
      rating
    );

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);

    // Update card
    const { rows: updatedRows } = await pool.query(
      `UPDATE cards
       SET ease_factor = $1, interval = $2, repetitions = $3, due_date = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [easeFactor, interval, repetitions, dueDate.toISOString(), cardId, userId]
    );

    // Record review
    await pool.query(
      'INSERT INTO reviews (user_id, card_id, rating) VALUES ($1, $2, $3)',
      [userId, cardId, rating]
    );

    const updatedCard = updatedRows[0];

    res.json(transformCardRow(updatedCard));
  })
);

// Get study stats
studyRouter.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { rows: statsRows } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM cards WHERE due_date <= NOW() AND user_id = $1) as total_due,
      (SELECT COUNT(*) FROM cards WHERE repetitions = 0 AND user_id = $1) as total_new,
      (SELECT COUNT(*) FROM reviews WHERE reviewed_at::date = CURRENT_DATE AND user_id = $1) as total_reviewed
  `, [userId]);

  // Calculate streak (simplified - just counts consecutive days with reviews)
  const { rows: streakRows } = await pool.query(`
    SELECT COUNT(DISTINCT reviewed_at::date) as days
    FROM reviews
    WHERE reviewed_at >= NOW() - INTERVAL '30 days' AND user_id = $1
  `, [userId]);

  const stats = statsRows[0];
  const streakResult = streakRows[0];

  res.json({
    totalDue: parseInt(stats.total_due) || 0,
    totalNew: parseInt(stats.total_new) || 0,
    totalReviewed: parseInt(stats.total_reviewed) || 0,
    streakDays: parseInt(streakResult.days) || 0
  });
}));
