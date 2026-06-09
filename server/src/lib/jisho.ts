/**
 * Jisho API client
 * Note: Jisho doesn't have an official API, but the search endpoint returns JSON
 *
 * Refactored to follow Single Responsibility Principle:
 * - JishoClient handles Jisho API interactions
 * - Sentence fetching delegated to SentenceAggregator
 * - Kanji fetching delegated to KanjiClient
 */

import { kanjiClient, type KanjiDetails } from './kanji.js';
import { sentenceAggregator, type Sentence } from './sentences/index.js';
import { extractKanji } from './japanese/kanji.js';
import { config } from '../config.js';

interface JishoWord {
  japanese: string;
  reading: string;
  meanings: string[];
  partsOfSpeech: string[];
  kanji: KanjiInfo[];
  sentences: Sentence[];
  jishoData: JishoEntry | null;
}

interface KanjiInfo {
  character: string;
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  strokeCount: number;
  jlptLevel: string | null;
}

interface JishoEntry {
  slug: string;
  isCommon: boolean;
  jlpt: string[];
  tags: string[];
  senses: Array<{
    englishDefinitions: string[];
    partsOfSpeech: string[];
    tags: string[];
    info: string[];
  }>;
}

interface JishoApiResponse {
  data: Array<{
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
  }>;
}

class JishoClient {
  private baseUrl = config.api.jisho.baseUrl;

  async search(query: string): Promise<JishoApiResponse['data']> {
    const url = `${this.baseUrl}/search/words?keyword=${encodeURIComponent(query)}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(config.api.timeoutMs) });

    if (!response.ok) {
      throw new Error(`Jisho API error: ${response.status}`);
    }

    const data = await response.json() as JishoApiResponse;
    return data.data;
  }

  private findBestMatch(
    results: JishoApiResponse['data'],
    query: string
  ): JishoApiResponse['data'][number] | null {
    if (results.length === 0) return null;
    return (
      results.find((r) =>
        r.japanese.some((j) => j.word === query || j.reading === query)
      ) ?? results[0]
    );
  }

  async getPreview(query: string): Promise<{ meaning: string; reading: string; isCommon: boolean } | null> {
    const match = this.findBestMatch(await this.search(query), query);
    if (!match) return null;
    return {
      meaning: match.senses[0]?.english_definitions[0] ?? '',
      reading: match.japanese[0]?.reading ?? '',
      isCommon: match.is_common,
    };
  }

  async getWordData(japanese: string): Promise<JishoWord | null> {
    const match = this.findBestMatch(await this.search(japanese), japanese);
    if (!match) return null;

    const japaneseForm = match.japanese[0];
    const word = japaneseForm.word || japaneseForm.reading;
    const reading = japaneseForm.reading;

    // Extract meanings and parts of speech
    const meanings: string[] = [];
    const partsOfSpeech: string[] = [];

    for (const sense of match.senses) {
      meanings.push(...sense.english_definitions);
      for (const pos of sense.parts_of_speech) {
        if (!partsOfSpeech.includes(pos)) {
          partsOfSpeech.push(pos);
        }
      }
    }

    // Kanji details and example sentences come from independent APIs; fetch both at once
    const [kanjiDetails, sentenceResult] = await Promise.all([
      kanjiClient.getMultipleKanji(extractKanji(word)),
      sentenceAggregator.search(word, config.limits.savedSentences)
    ]);

    const kanji: KanjiInfo[] = kanjiDetails.map((k: KanjiDetails) => ({
      character: k.character,
      meanings: k.meanings,
      readings: k.readings,
      strokeCount: k.strokeCount,
      jlptLevel: k.jlptLevel ? `N${k.jlptLevel}` : null
    }));

    const sentences = sentenceResult.sentences;

    return {
      japanese: word,
      reading,
      meanings: meanings.slice(0, config.limits.defaultMeanings),
      partsOfSpeech,
      kanji,
      sentences,
      jishoData: {
        slug: match.slug,
        isCommon: match.is_common,
        jlpt: match.jlpt,
        tags: match.tags,
        senses: match.senses.map(s => ({
          englishDefinitions: s.english_definitions,
          partsOfSpeech: s.parts_of_speech,
          tags: s.tags,
          info: s.info
        }))
      }
    };
  }
}

export const jishoClient = new JishoClient();
