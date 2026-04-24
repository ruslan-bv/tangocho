// Auth types

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// Core data types

export interface Word {
  id: number;
  japanese: string;
  reading: string;
  meanings: string[];
  partsOfSpeech: string[];
  kanji: KanjiInfo[];
  sentences: Sentence[];
  jishoData: JishoEntry | null;
  createdAt: string;
  updatedAt: string;
}

export interface KanjiInfo {
  character: string;
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  strokeCount: number;
  jlptLevel: string | null;
}

export interface Sentence {
  japanese: string;
  furigana: string;
  english: string;
  source: string;
}

export interface JishoEntry {
  slug: string;
  isCommon: boolean;
  jlpt: string[];
  tags: string[];
  senses: JishoSense[];
}

export interface JishoSense {
  englishDefinitions: string[];
  partsOfSpeech: string[];
  tags: string[];
  info: string[];
}

export interface Deck {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithStats extends Deck {
  totalCards: number;
  dueCards: number;
  newCards: number;
}

export interface Card {
  id: number;
  wordId: number;
  deckId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  word?: Word;
}

export interface CardWithWord extends Card {
  word: Word;
}

export interface Review {
  id: number;
  cardId: number;
  rating: ReviewRating;
  reviewedAt: string;
}

export type ReviewRating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

export interface StudyStats {
  totalDue: number;
  totalNew: number;
  totalReviewed: number;
  streakDays: number;
}

// API request/response types

export interface AddWordRequest {
  japanese: string;
  deckId: number;
}

export interface AddWordResponse {
  word: Word;
  card: Card;
}

export interface CreateDeckRequest {
  name: string;
  description?: string;
}

export interface ReviewCardRequest {
  cardId: number;
  rating: ReviewRating;
}

export interface JishoSearchResponse {
  data: JishoSearchResult[];
}

export interface JishoSearchResult {
  slug: string;
  is_common: boolean;
  jlpt: string[];
  tags: string[];
  japanese: Array<{
    word?: string;
    reading: string;
  }>;
  senses: Array<{
    english_definitions: string[];
    parts_of_speech: string[];
    tags: string[];
    info: string[];
  }>;
}

// Sentences API types (Tatoeba + Immersion Kit)
export interface SentenceExample {
  japanese: string;
  furigana: string;
  english: string;
  source: string;
  audioUrl?: string;
}

export interface SentencesResponse {
  sentences: SentenceExample[];
  source: 'tatoeba' | 'immersionkit' | 'none';
}
