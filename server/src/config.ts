/**
 * Centralized configuration for the Tangocho server.
 * Consolidates hardcoded values from across the codebase.
 */

export const config = {
  /** External API endpoints */
  api: {
    jisho: {
      baseUrl: 'https://jisho.org/api/v1',
    },
    tatoeba: {
      baseUrl: 'https://api.tatoeba.org/unstable',
    },
    kanjiapi: {
      baseUrl: 'https://kanjiapi.dev/v1',
    },
    immersionkit: {
      baseUrl: 'https://apiv2.immersionkit.com',
      maxLimit: 20,
    },
  },

  /** SM-2 Spaced Repetition System constants */
  srs: {
    /** Minimum ease factor to prevent cards from becoming too difficult */
    minEaseFactor: 1.3,
    /** Maximum interval in days (1 year) */
    maxInterval: 365,
    /** Bonus multiplier for "Easy" rating */
    easyBonus: 1.3,
    /** Default ease factor for new cards */
    defaultEaseFactor: 2.5,
    /** First successful review interval in days */
    firstInterval: 1,
    /** Second successful review interval in days */
    secondInterval: 6,
  },

  /** Default limits for API responses */
  limits: {
    defaultSentences: 5,
    maxSentences: 20,
    defaultMeanings: 10,
    dueCardsLimit: 50,
  },
} as const;
