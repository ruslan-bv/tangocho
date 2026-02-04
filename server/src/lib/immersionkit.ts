/**
 * Immersion Kit API client for fetching example sentences from anime/media
 *
 * Note: This file is kept for backwards compatibility.
 * The ImmersionKitSentenceProvider in lib/sentences/index.ts is now the primary implementation.
 */

import { config } from '../config.js';

export interface ImmersionKitExample {
  id: string;
  sentence: string;
  sentence_with_furigana: string;
  translation: string;
  image: string;
  sound: string;
  title: string;
  category?: string;
}

export interface ImmersionKitResponse {
  examples: ImmersionKitExample[];
}

export interface SearchOptions {
  limit?: number;
  category?: string;
}

class ImmersionKitClient {
  private baseUrl = config.api.immersionkit.baseUrl;
  private maxLimit = config.api.immersionkit.maxLimit;

  async search(query: string, options: SearchOptions = {}): Promise<ImmersionKitResponse> {
    const limit = Math.min(options.limit || config.limits.defaultSentences, this.maxLimit);

    const params = new URLSearchParams({
      q: query.trim(),
      limit: String(limit),
      showUrlInMedia: 'true'
    });

    if (options.category) {
      params.set('category', options.category);
    }

    const response = await fetch(`${this.baseUrl}/search?${params}`);

    if (!response.ok) {
      throw new Error(`Immersion Kit API returned ${response.status}`);
    }

    return response.json();
  }
}

export const immersionKitClient = new ImmersionKitClient();
