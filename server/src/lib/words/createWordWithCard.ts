import { pool } from '../../db/index.js';
import { jishoClient } from '../jisho.js';
import { WordRow, CardRow } from '../transformers.js';

export type CreateFailureReason = 'word_not_found' | 'already_in_deck';

export type CreateOutcome =
  | { ok: true; word: WordRow; card: CardRow }
  | { ok: false; reason: CreateFailureReason };

// Caller must verify deck ownership before invoking.
export async function createWordWithCard(
  userId: number,
  deckId: number,
  japanese: string
): Promise<CreateOutcome> {
  const wordData = await jishoClient.getWordData(japanese.trim());
  if (!wordData) return { ok: false, reason: 'word_not_found' };

  const existing = await pool.query<WordRow>(
    'SELECT * FROM words WHERE japanese = $1 AND user_id = $2',
    [wordData.japanese, userId]
  );

  let word: WordRow;
  if (existing.rows.length === 0) {
    const { rows } = await pool.query<WordRow>(
      `INSERT INTO words (user_id, japanese, reading, meanings, parts_of_speech, kanji, sentences, jisho_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        wordData.japanese,
        wordData.reading,
        JSON.stringify(wordData.meanings),
        JSON.stringify(wordData.partsOfSpeech),
        JSON.stringify(wordData.kanji),
        JSON.stringify(wordData.sentences),
        JSON.stringify(wordData.jishoData),
      ]
    );
    word = rows[0];
  } else {
    word = existing.rows[0];
  }

  const existingCard = await pool.query(
    'SELECT id FROM cards WHERE word_id = $1 AND deck_id = $2 AND user_id = $3',
    [word.id, deckId, userId]
  );
  if (existingCard.rows.length > 0) {
    return { ok: false, reason: 'already_in_deck' };
  }

  const { rows: cardRows } = await pool.query<CardRow>(
    'INSERT INTO cards (user_id, word_id, deck_id) VALUES ($1, $2, $3) RETURNING *',
    [userId, word.id, deckId]
  );

  return { ok: true, word, card: cardRows[0] };
}
