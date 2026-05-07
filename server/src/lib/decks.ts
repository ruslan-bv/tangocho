import { pool } from '../db/index.js';

export async function userOwnsDeck(userId: number, deckId: number | string): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM decks WHERE id = $1 AND user_id = $2',
    [deckId, userId]
  );
  return rows.length > 0;
}
