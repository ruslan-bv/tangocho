import { Router } from 'express';
import { pool } from '../db/index.js';
import { jishoClient } from '../lib/jisho.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateTrimmedBody, validateBody } from '../middleware/validate.js';
import { notFound, conflict, created } from '../lib/responses.js';
import { WordRow, CardRow, transformWordRow, transformCardRow } from '../lib/transformers.js';

export const wordsRouter = Router();

// Add a new word
wordsRouter.post('/',
  validateTrimmedBody('japanese', 'Japanese word is required'),
  validateBody('deckId'),
  asyncHandler(async (req, res) => {
    const { japanese, deckId } = req.body;

    // Check if deck exists
    const deckResult = await pool.query('SELECT id FROM decks WHERE id = $1', [deckId]);
    if (deckResult.rows.length === 0) {
      return notFound(res, 'Deck');
    }

    // Fetch word data from Jisho
    const wordData = await jishoClient.getWordData(japanese.trim());

    if (!wordData) {
      return notFound(res, 'Word not found in dictionary');
    }

    // Check if word already exists
    const existingWord = await pool.query<WordRow>(
      'SELECT * FROM words WHERE japanese = $1',
      [wordData.japanese]
    );

    let word: WordRow;

    if (existingWord.rows.length === 0) {
      // Insert new word
      const { rows } = await pool.query<WordRow>(
        `INSERT INTO words (japanese, reading, meanings, parts_of_speech, kanji, sentences, jisho_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          wordData.japanese,
          wordData.reading,
          JSON.stringify(wordData.meanings),
          JSON.stringify(wordData.partsOfSpeech),
          JSON.stringify(wordData.kanji),
          JSON.stringify(wordData.sentences),
          JSON.stringify(wordData.jishoData)
        ]
      );
      word = rows[0];
    } else {
      word = existingWord.rows[0];
    }

    // Check if card already exists in this deck
    const existingCard = await pool.query(
      'SELECT id FROM cards WHERE word_id = $1 AND deck_id = $2',
      [word.id, deckId]
    );

    if (existingCard.rows.length > 0) {
      return conflict(res, 'Word already exists in this deck');
    }

    // Create card
    const { rows: cardRows } = await pool.query<CardRow>(
      'INSERT INTO cards (word_id, deck_id) VALUES ($1, $2) RETURNING *',
      [word.id, deckId]
    );

    const card = cardRows[0];

    created(res, {
      word: transformWordRow(word),
      card: transformCardRow(card)
    });
  })
);

// Get a word by ID
wordsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await pool.query<WordRow>(
    'SELECT * FROM words WHERE id = $1',
    [req.params.id]
  );

  const word = rows[0];
  if (!word) {
    return notFound(res, 'Word');
  }

  res.json(transformWordRow(word));
}));
