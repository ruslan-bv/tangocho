import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tangocho'
});

export async function initDatabase() {
  await pool.query(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Sessions table (cookie-based, opaque token)
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Decks table
    CREATE TABLE IF NOT EXISTS decks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Words table
    CREATE TABLE IF NOT EXISTS words (
      id SERIAL PRIMARY KEY,
      japanese TEXT NOT NULL,
      reading TEXT NOT NULL,
      meanings JSONB NOT NULL,
      parts_of_speech JSONB NOT NULL DEFAULT '[]',
      kanji JSONB NOT NULL DEFAULT '[]',
      sentences JSONB NOT NULL DEFAULT '[]',
      jisho_data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Cards table (links words to decks with SRS data)
    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      due_date TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(word_id, deck_id)
    );

    -- Reviews table (history of reviews)
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      reviewed_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Scope existing tables to users via user_id (idempotent)
    ALTER TABLE decks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE words ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE cards ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

    -- Drop the legacy global UNIQUE(word_id, deck_id) so the same Jisho entry can exist per-user
    ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_word_id_deck_id_key;

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
    CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
    CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
    CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
    CREATE INDEX IF NOT EXISTS idx_cards_word_id ON cards(word_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_card_id ON reviews(card_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON reviews(reviewed_at);
    CREATE INDEX IF NOT EXISTS idx_words_japanese ON words(japanese);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_user_word_deck ON cards(user_id, word_id, deck_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_words_user_japanese ON words(user_id, japanese);
  `);
}

export async function ensureDefaultDeck(userId: number): Promise<void> {
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM decks WHERE user_id = $1', [userId]);
  if (parseInt(rows[0].count) === 0) {
    await pool.query(
      'INSERT INTO decks (user_id, name, description) VALUES ($1, $2, $3)',
      [userId, '日本語', '日本語の語彙学習用デッキ']
    );
  }
}
