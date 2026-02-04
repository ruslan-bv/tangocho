import type {
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
  SentencesResponse
} from './types';

const API_BASE = '/api';

class ApiClient {
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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
}

export const api = new ApiClient();
