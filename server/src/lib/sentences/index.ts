/**
 * Sentence Provider Interface and Implementations
 *
 * Follows SOLID principles:
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: High-level modules depend on abstraction
 * - Open/Closed: New providers can be added without modifying existing code
 * - Liskov Substitution: All providers are interchangeable
 */

import { config } from '../../config.js';

export interface Sentence {
  japanese: string;
  furigana: string;
  english: string;
  source: string;
  audioUrl?: string;
}

export interface SentenceSearchResult {
  sentences: Sentence[];
  source: string;
}

/**
 * Interface for sentence providers (Tatoeba, Immersion Kit, etc.)
 */
export interface SentenceProvider {
  readonly name: string;
  search(query: string, limit: number): Promise<Sentence[]>;
}

/**
 * Tatoeba API response types
 */
interface TatoebaTranscription {
  script: string;
  text: string;
  html: string;
  needsReview: boolean;
}

interface TatoebaAudio {
  id: number;
  author: string;
  download_url: string;
}

interface TatoebaTranslation {
  id: number;
  text: string;
  lang: string;
  is_direct: boolean;
  audios: TatoebaAudio[];
}

interface TatoebaSentence {
  id: number;
  text: string;
  lang: string;
  license: string;
  transcriptions: TatoebaTranscription[];
  translations: TatoebaTranslation[];
  audios: TatoebaAudio[];
}

interface TatoebaResponse {
  data: TatoebaSentence[];
  paging: {
    total: number;
    has_next: boolean;
  };
}

/**
 * Tatoeba sentence provider
 */
export class TatoebaSentenceProvider implements SentenceProvider {
  readonly name = 'tatoeba';
  private baseUrl = config.api.tatoeba.baseUrl;

  async search(query: string, limit: number): Promise<Sentence[]> {
    const params = new URLSearchParams({
      lang: 'jpn',
      q: query,
      sort: 'relevance',
      limit: String(limit),
      'trans:lang': 'eng',
      showtrans: 'matching'
    });

    const response = await fetch(`${this.baseUrl}/sentences?${params}`);

    if (!response.ok) {
      throw new Error(`Tatoeba API returned ${response.status}`);
    }

    const data: TatoebaResponse = await response.json();

    return data.data
      .filter(sentence => sentence.translations.length > 0)
      .map(sentence => {
        const furiganaTranscription = sentence.transcriptions.find(t => t.html);
        const furigana = furiganaTranscription?.html || sentence.text;
        const directTranslation = sentence.translations.find(t => t.is_direct);
        const englishTranslation = directTranslation || sentence.translations[0];
        const audioUrl = sentence.audios[0]?.download_url;

        return {
          japanese: sentence.text,
          furigana,
          english: englishTranslation.text,
          source: 'Tatoeba',
          audioUrl
        };
      });
  }
}

/**
 * Immersion Kit API response types
 */
interface ImmersionKitExample {
  id: string;
  sentence: string;
  sentence_with_furigana: string;
  translation: string;
  image: string;
  sound: string;
  title: string;
  category?: string;
}

interface ImmersionKitResponse {
  examples: ImmersionKitExample[];
}

/**
 * Immersion Kit sentence provider
 */
export class ImmersionKitSentenceProvider implements SentenceProvider {
  readonly name = 'immersionkit';
  private baseUrl = config.api.immersionkit.baseUrl;
  private maxLimit = config.api.immersionkit.maxLimit;

  async search(query: string, limit: number): Promise<Sentence[]> {
    const actualLimit = Math.min(limit, this.maxLimit);

    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(actualLimit),
      showUrlInMedia: 'true'
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`);

    if (!response.ok) {
      throw new Error(`Immersion Kit API returned ${response.status}`);
    }

    const data: ImmersionKitResponse = await response.json();

    return data.examples.slice(0, actualLimit).map(example => ({
      japanese: example.sentence,
      furigana: example.sentence_with_furigana,
      english: example.translation,
      source: example.title,
      audioUrl: example.sound || undefined
    }));
  }
}

/**
 * Aggregates multiple sentence providers with fallback behavior.
 * Tries providers in order until one returns results.
 */
export class SentenceAggregator {
  constructor(private providers: SentenceProvider[]) {}

  async search(query: string, limit: number): Promise<SentenceSearchResult> {
    for (const provider of this.providers) {
      try {
        const sentences = await provider.search(query, limit);
        if (sentences.length > 0) {
          return { sentences, source: provider.name };
        }
      } catch (error) {
        console.error(`${provider.name} API error:`, error);
        continue;
      }
    }
    return { sentences: [], source: 'none' };
  }
}

// Default instances
export const tatoebaSentenceProvider = new TatoebaSentenceProvider();
export const immersionKitSentenceProvider = new ImmersionKitSentenceProvider();

// Default aggregator with Tatoeba first, Immersion Kit as fallback
export const sentenceAggregator = new SentenceAggregator([
  tatoebaSentenceProvider,
  immersionKitSentenceProvider
]);
