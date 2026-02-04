import { Router } from 'express';
import { pool } from '../db/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notFound, noContent } from '../lib/responses.js';
import { CardWithWordRow, transformCardWithWordRow } from '../lib/transformers.js';

export const cardsRouter = Router();

// Get a single card with its word
cardsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query<CardWithWordRow>(`
    SELECT c.*, w.*,
      c.id as card_id,
      w.id as word_id
    FROM cards c
    JOIN words w ON c.word_id = w.id
    WHERE c.id = $1
  `, [req.params.id]);

  const row = rows[0];
  if (!row) {
    return notFound(res, 'Card');
  }

  res.json(transformCardWithWordRow(row));
}));

// Delete a card
cardsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM cards WHERE id = $1',
    [req.params.id]
  );

  if (rowCount === 0) {
    return notFound(res, 'Card');
  }

  noContent(res);
}));
