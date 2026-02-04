import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/tangocho'
});

export async function initDatabase() {
  // Create tables
  await pool.query(`
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

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_cards_due_date ON cards(due_date);
    CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
    CREATE INDEX IF NOT EXISTS idx_cards_word_id ON cards(word_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_card_id ON reviews(card_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON reviews(reviewed_at);
    CREATE INDEX IF NOT EXISTS idx_words_japanese ON words(japanese);
  `);

  // Create default deck if none exists
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM decks');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(
      'INSERT INTO decks (name, description) VALUES ($1, $2)',
      ['日本語', '日本語の語彙学習用デッキ']
    );
  }
}
