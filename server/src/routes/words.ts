import { Router } from 'express';
import { pool } from '../db/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateTrimmedBody, validateIntBody, validateIdParam } from '../middleware/validate.js';
import { notFound, conflict, created } from '../lib/responses.js';
import { WordRow, transformWordRow, transformCardRow } from '../lib/transformers.js';
import { createWordWithCard } from '../lib/words/createWordWithCard.js';
import { userOwnsDeck } from '../lib/decks.js';

export const wordsRouter = Router();

wordsRouter.use(requireAuth);

// Add a new word
wordsRouter.post('/',
  validateTrimmedBody('japanese', 'Japanese word is required'),
  validateIntBody('deckId'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { japanese, deckId } = req.body;

    if (!(await userOwnsDeck(userId, deckId))) {
      return notFound(res, 'Deck');
    }

    const result = await createWordWithCard(userId, deckId, japanese);
    if (!result.ok) {
      if (result.reason === 'word_not_found') {
        return notFound(res, 'Word not found in dictionary');
      }
      return conflict(res, 'Word already exists in this deck');
    }

    created(res, {
      word: transformWordRow(result.word),
      card: transformCardRow(result.card),
    });
  })
);

// Get a word by ID
wordsRouter.get('/:id', validateIdParam('id'), asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { rows } = await pool.query<WordRow>(
    'SELECT * FROM words WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );

  const word = rows[0];
  if (!word) {
    return notFound(res, 'Word');
  }

  res.json(transformWordRow(word));
}));
