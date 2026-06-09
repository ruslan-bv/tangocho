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
      c.created_at as card_created_at,
      c.updated_at as card_updated_at,
      w.id as word_id
    FROM cards c
    JOIN words w ON c.word_id = w.id
    WHERE c.due_date <= NOW() AND c.user_id = $1
  `;

  const params: (number | string)[] = [userId];

  if (deckId !== undefined) {
    const parsedDeckId = Number(deckId);
    if (!Number.isInteger(parsedDeckId)) {
      return badRequest(res, 'deckId must be an integer');
    }
    params.push(parsedDeckId);
    query += ` AND c.deck_id = $${params.length}`;
  }

  params.push(config.limits.dueCardsLimit);
  query += ` ORDER BY c.due_date ASC LIMIT $${params.length}`;

  const { rows } = await pool.query<CardWithWordRow>(query, params);

  res.json(rows.map(transformCardWithWordRow));
}));

// Submit review
studyRouter.post('/review',
  validateBody('cardId', 'rating'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { cardId } = req.body;
    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 4) {
      return badRequest(res, 'Rating must be an integer between 1 and 4');
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

    // Update card and record the review atomically
    const client = await pool.connect();
    let updatedCard;
    try {
      await client.query('BEGIN');
      const { rows: updatedRows } = await client.query(
        `UPDATE cards
         SET ease_factor = $1, interval = $2, repetitions = $3, due_date = $4, updated_at = NOW()
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [easeFactor, interval, repetitions, dueDate.toISOString(), cardId, userId]
      );
      await client.query(
        'INSERT INTO reviews (user_id, card_id, rating) VALUES ($1, $2, $3)',
        [userId, cardId, rating]
      );
      await client.query('COMMIT');
      updatedCard = updatedRows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

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

  // Streak: consecutive review days ending today (or yesterday if today has no reviews yet)
  const { rows: streakRows } = await pool.query(`
    WITH days AS (
      SELECT DISTINCT reviewed_at::date AS day
      FROM reviews
      WHERE user_id = $1
    ),
    anchor AS (
      SELECT CASE
        WHEN EXISTS (SELECT 1 FROM days WHERE day = CURRENT_DATE) THEN CURRENT_DATE
        ELSE CURRENT_DATE - 1
      END AS start_day
    ),
    numbered AS (
      SELECT day, (ROW_NUMBER() OVER (ORDER BY day DESC) - 1)::int AS offset
      FROM days
      WHERE day <= (SELECT start_day FROM anchor)
    )
    SELECT COUNT(*) AS days
    FROM numbered
    WHERE day = (SELECT start_day FROM anchor) - offset
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
