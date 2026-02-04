/**
 * Kanji API client using kanjiapi.dev
 */

import { config } from '../config.js';

interface KanjiApiResponse {
  kanji: string;
  grade: number | null;
  stroke_count: number;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  jlpt: number | null;
  unicode: string;
  heisig_en: string | null;
}

export interface KanjiDetails {
  character: string;
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  strokeCount: number;
  jlptLevel: number | null;
  grade: number | null;
}

class KanjiClient {
  private baseUrl = config.api.kanjiapi.baseUrl;
  private cache = new Map<string, KanjiDetails>();

  async getKanjiDetails(character: string): Promise<KanjiDetails | null> {
    // Check cache first
    if (this.cache.has(character)) {
      return this.cache.get(character)!;
    }

    try {
      const response = await fetch(`${this.baseUrl}/kanji/${encodeURIComponent(character)}`);

      if (!response.ok) {
        return null;
      }

      const data: KanjiApiResponse = await response.json();

      const details: KanjiDetails = {
        character: data.kanji,
        meanings: data.meanings,
        readings: {
          onyomi: data.on_readings,
          kunyomi: data.kun_readings
        },
        strokeCount: data.stroke_count,
        jlptLevel: data.jlpt,
        grade: data.grade
      };

      // Cache the result
      this.cache.set(character, details);

      return details;
    } catch {
      return null;
    }
  }

  async getMultipleKanji(characters: string[]): Promise<KanjiDetails[]> {
    const results = await Promise.all(
      characters.map(char => this.getKanjiDetails(char))
    );
    return results.filter((k): k is KanjiDetails => k !== null);
  }
}

export const kanjiClient = new KanjiClient();
