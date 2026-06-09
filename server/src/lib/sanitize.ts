/**
 * Sanitization for HTML sourced from external APIs (Tatoeba, Immersion Kit).
 * Furigana markup is allowed only as ruby annotations; everything else is stripped.
 */

import sanitizeHtml from 'sanitize-html';

const FURIGANA_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['ruby', 'rb', 'rt', 'rp', 'span'],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

export function sanitizeFurigana(html: string): string {
  return sanitizeHtml(html, FURIGANA_OPTIONS);
}

/**
 * Sanitizes the furigana HTML of stored sentence objects on the way out of the
 * database, covering rows saved before sanitization was added at ingestion.
 */
export function sanitizeSentences(sentences: object[]): object[] {
  if (!Array.isArray(sentences)) return sentences;
  return sentences.map((sentence) => {
    const furigana = (sentence as { furigana?: unknown })?.furigana;
    return typeof furigana === 'string'
      ? { ...sentence, furigana: sanitizeFurigana(furigana) }
      : sentence;
  });
}
