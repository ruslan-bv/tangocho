/**
 * Tatoeba API client
 * Documentation: https://api.tatoeba.org/unstable
 *
 * Note: This file is kept for backwards compatibility.
 * The TatoebaSentenceProvider in lib/sentences/index.ts is now the primary implementation.
 */

import { config } from '../config.js';

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

export interface Sentence {
  japanese: string;
  furigana: string;
  english: string;
  source: string;
  audioUrl?: string;
}

class TatoebaClient {
  private baseUrl = config.api.tatoeba.baseUrl;

  async searchSentences(word: string, limit: number = 10): Promise<Sentence[]> {
    const params = new URLSearchParams({
      lang: 'jpn',
      q: word,
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
        // Get furigana HTML from transcriptions
        const furiganaTranscription = sentence.transcriptions.find(t => t.html);
        const furigana = furiganaTranscription?.html || sentence.text;

        // Get the first direct English translation, or any English translation
        const directTranslation = sentence.translations.find(t => t.is_direct);
        const englishTranslation = directTranslation || sentence.translations[0];

        // Get Japanese audio URL only (no English audio)
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

export const tatoebaClient = new TatoebaClient();
