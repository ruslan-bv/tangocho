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

  // Upsert so concurrent inserts (e.g. bulk import) can't race the unique index;
  // the no-op DO UPDATE makes RETURNING yield the existing row on conflict.
  const { rows } = await pool.query<WordRow>(
    `INSERT INTO words (user_id, japanese, reading, meanings, parts_of_speech, kanji, sentences, jisho_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id, japanese) DO UPDATE SET updated_at = NOW()
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
  const word = rows[0];

  const { rows: cardRows } = await pool.query<CardRow>(
    `INSERT INTO cards (user_id, word_id, deck_id) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, word_id, deck_id) DO NOTHING
     RETURNING *`,
    [userId, word.id, deckId]
  );
  if (cardRows.length === 0) {
    return { ok: false, reason: 'already_in_deck' };
  }

  return { ok: true, word, card: cardRows[0] };
}
