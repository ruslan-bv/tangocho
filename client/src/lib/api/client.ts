import type {
  AuthUser,
  Deck,
  DeckWithStats,
  Card,
  CardWithWord,
  Word,
  StudyStats,
  AddWordRequest,
  AddWordResponse,
  CreateDeckRequest,
  ReviewCardRequest,
  JishoSearchResponse,
  SentencesResponse,
  ParseTextResponse,
  BulkImportResponse
} from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Lets the auth store react to session expiry (401s outside /auth endpoints)
// without a circular import.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

class ApiClient {
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401 && !path.startsWith('/auth')) {
        onUnauthorized?.();
      }
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(error.message || `HTTP ${response.status}`, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      return await this.fetch<AuthUser>('/auth/me');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  }

  async logout(): Promise<void> {
    await this.fetch<void>('/auth/logout', { method: 'POST' });
  }

  async login(email: string, password: string): Promise<AuthUser> {
    return this.fetch<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(email: string, password: string, name?: string): Promise<AuthUser> {
    return this.fetch<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }

  // Decks
  async getDecks(): Promise<DeckWithStats[]> {
    return this.fetch<DeckWithStats[]>('/decks');
  }

  async getDeck(id: number): Promise<DeckWithStats> {
    return this.fetch<DeckWithStats>(`/decks/${id}`);
  }

  async createDeck(data: CreateDeckRequest): Promise<Deck> {
    return this.fetch<Deck>('/decks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateDeck(id: number, data: Partial<CreateDeckRequest>): Promise<Deck> {
    return this.fetch<Deck>(`/decks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteDeck(id: number): Promise<void> {
    await this.fetch(`/decks/${id}`, { method: 'DELETE' });
  }

  // Words
  async searchJisho(query: string): Promise<JishoSearchResponse> {
    return this.fetch<JishoSearchResponse>(`/jisho/search?q=${encodeURIComponent(query)}`);
  }

  // Example sentences (Tatoeba with Immersion Kit fallback)
  async searchSentences(query: string, limit: number = 10): Promise<SentencesResponse> {
    return this.fetch<SentencesResponse>(
      `/sentences/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async addWord(data: AddWordRequest): Promise<AddWordResponse> {
    return this.fetch<AddWordResponse>('/words', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getWord(id: number): Promise<Word> {
    return this.fetch<Word>(`/words/${id}`);
  }

  // Cards
  async getDeckCards(deckId: number): Promise<CardWithWord[]> {
    return this.fetch<CardWithWord[]>(`/decks/${deckId}/cards`);
  }

  async getCard(id: number): Promise<CardWithWord> {
    return this.fetch<CardWithWord>(`/cards/${id}`);
  }

  async deleteCard(id: number): Promise<void> {
    await this.fetch(`/cards/${id}`, { method: 'DELETE' });
  }

  async getDueCards(deckId?: number): Promise<CardWithWord[]> {
    const path = deckId ? `/study/due?deckId=${deckId}` : '/study/due';
    return this.fetch<CardWithWord[]>(path);
  }

  async reviewCard(data: ReviewCardRequest): Promise<Card> {
    return this.fetch<Card>('/study/review', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Stats
  async getStudyStats(): Promise<StudyStats> {
    return this.fetch<StudyStats>('/study/stats');
  }

  // Import from text
  async parseText(text: string, deckId?: number): Promise<ParseTextResponse> {
    return this.fetch<ParseTextResponse>('/import/parse', {
      method: 'POST',
      body: JSON.stringify({ text, deckId })
    });
  }

  async bulkImport(deckId: number, lemmas: string[]): Promise<BulkImportResponse> {
    return this.fetch<BulkImportResponse>('/import/bulk', {
      method: 'POST',
      body: JSON.stringify({ deckId, lemmas })
    });
  }
}

export const api = new ApiClient();
