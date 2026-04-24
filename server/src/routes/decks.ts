import { Router } from 'express';
import { pool } from '../db/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTrimmedBody } from '../middleware/validate.js';
import { notFound, badRequest, created, noContent } from '../lib/responses.js';
import { DeckRow, CardWithWordRow, transformDeckRow, transformCardWithWordRow } from '../lib/transformers.js';

export const decksRouter = Router();

decksRouter.use(requireAuth);

// Get all decks with stats
decksRouter.get('/', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { rows } = await pool.query<DeckRow>(`
    SELECT
      d.*,
      COUNT(c.id) as total_cards,
      SUM(CASE WHEN c.due_date <= NOW() THEN 1 ELSE 0 END) as due_cards,
      SUM(CASE WHEN c.repetitions = 0 THEN 1 ELSE 0 END) as new_cards
    FROM decks d
    LEFT JOIN cards c ON d.id = c.deck_id AND c.user_id = $1
    WHERE d.user_id = $1
    GROUP BY d.id
    ORDER BY d.updated_at DESC
  `, [userId]);

  res.json(rows.map(transformDeckRow));
}));

// Get single deck with stats
decksRouter.get('/:id', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { rows } = await pool.query<DeckRow>(`
    SELECT
      d.*,
      COUNT(c.id) as total_cards,
      SUM(CASE WHEN c.due_date <= NOW() THEN 1 ELSE 0 END) as due_cards,
      SUM(CASE WHEN c.repetitions = 0 THEN 1 ELSE 0 END) as new_cards
    FROM decks d
    LEFT JOIN cards c ON d.id = c.deck_id AND c.user_id = $2
    WHERE d.id = $1 AND d.user_id = $2
    GROUP BY d.id
  `, [req.params.id, userId]);

  const deck = rows[0];
  if (!deck) {
    return notFound(res, 'Deck');
  }

  res.json(transformDeckRow(deck));
}));

// Get cards in deck
decksRouter.get('/:id/cards', asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const owner = await pool.query(
    'SELECT id FROM decks WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );
  if (owner.rows.length === 0) {
    return notFound(res, 'Deck');
  }

  const { rows } = await pool.query<CardWithWordRow>(`
    SELECT c.*, w.*,
      c.id as card_id,
      w.id as word_id
    FROM cards c
    JOIN words w ON c.word_id = w.id
    WHERE c.deck_id = $1 AND c.user_id = $2
    ORDER BY c.due_date ASC
  `, [req.params.id, userId]);

  res.json(rows.map(transformCardWithWordRow));
}));

// Create deck
decksRouter.post('/',
  validateTrimmedBody('name', 'Name is required'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { name, description = '' } = req.body;

    const { rows } = await pool.query(
      'INSERT INTO decks (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, name.trim(), description.trim()]
    );

    const deck = rows[0];
    created(res, transformDeckRow(deck));
  })
);

// Update deck
decksRouter.patch('/:id', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { name, description } = req.body;
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name.trim());
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description.trim());
  }

  if (updates.length === 0) {
    return badRequest(res, 'No updates provided');
  }

  updates.push('updated_at = NOW()');
  values.push(parseInt(req.params.id));
  values.push(userId);

  const { rows } = await pool.query(
    `UPDATE decks SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );

  const deck = rows[0];
  if (!deck) {
    return notFound(res, 'Deck');
  }

  res.json(transformDeckRow(deck));
}));

// Delete deck
decksRouter.delete('/:id', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { rowCount } = await pool.query(
    'DELETE FROM decks WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );

  if (rowCount === 0) {
    return notFound(res, 'Deck');
  }

  noContent(res);
}));
