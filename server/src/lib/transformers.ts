/**
 * Shared response transformers for database rows to API responses
 * Centralizes snake_case to camelCase mapping
 */

// Row types from database
export interface DeckRow {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  total_cards?: string;
  due_cards?: string;
  new_cards?: string;
}

export interface WordRow {
  id: number;
  japanese: string;
  reading: string;
  meanings: string[];
  parts_of_speech: string[];
  kanji: object[];
  sentences: object[];
  jisho_data: object | null;
  created_at: string;
  updated_at: string;
}

export interface CardRow {
  id: number;
  word_id: number;
  deck_id: number;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface CardWithWordRow extends CardRow {
  card_id: number;
  japanese: string;
  reading: string;
  meanings: string[];
  parts_of_speech: string[];
  kanji: object[];
  sentences: object[];
  jisho_data: object | null;
}

export interface ImmersionKitExample {
  sentence: string;
  sentence_with_furigana: string;
  translation: string;
  title: string;
  sound?: string;
}

// Transform deck row to API response
export function transformDeckRow(deck: DeckRow) {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    createdAt: deck.created_at,
    updatedAt: deck.updated_at,
    ...(deck.total_cards !== undefined && {
      totalCards: parseInt(deck.total_cards) || 0,
      dueCards: parseInt(deck.due_cards!) || 0,
      newCards: parseInt(deck.new_cards!) || 0
    })
  };
}

// Transform word row to API response
export function transformWordRow(word: WordRow) {
  return {
    id: word.id,
    japanese: word.japanese,
    reading: word.reading,
    meanings: word.meanings,
    partsOfSpeech: word.parts_of_speech,
    kanji: word.kanji,
    sentences: word.sentences,
    jishoData: word.jisho_data,
    createdAt: word.created_at,
    updatedAt: word.updated_at
  };
}

// Transform card row to API response (without word)
export function transformCardRow(card: CardRow) {
  return {
    id: card.id,
    wordId: card.word_id,
    deckId: card.deck_id,
    easeFactor: card.ease_factor,
    interval: card.interval,
    repetitions: card.repetitions,
    dueDate: card.due_date,
    createdAt: card.created_at,
    updatedAt: card.updated_at
  };
}

// Transform card with word join to API response
export function transformCardWithWordRow(row: CardWithWordRow) {
  return {
    id: row.card_id,
    wordId: row.word_id,
    deckId: row.deck_id,
    easeFactor: row.ease_factor,
    interval: row.interval,
    repetitions: row.repetitions,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    word: {
      id: row.word_id,
      japanese: row.japanese,
      reading: row.reading,
      meanings: row.meanings,
      partsOfSpeech: row.parts_of_speech,
      kanji: row.kanji,
      sentences: row.sentences,
      jishoData: row.jisho_data
    }
  };
}

// Transform Immersion Kit example to sentence format
export function transformImmersionKitExample(example: ImmersionKitExample) {
  return {
    japanese: example.sentence,
    furigana: example.sentence_with_furigana,
    english: example.translation,
    source: example.title,
    audioUrl: example.sound
  };
}
