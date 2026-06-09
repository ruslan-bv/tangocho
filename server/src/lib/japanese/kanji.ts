/**
 * Shared kanji character detection.
 * Covers the CJK Unified Ideographs block (U+4E00–U+9FFF) and Extension A
 * (U+3400–U+4DBF), which earlier per-file regexes truncated inconsistently.
 */

const KANJI_RANGE = '\\u3400-\\u4dbf\\u4e00-\\u9fff';

const KANJI_RE = new RegExp(`[${KANJI_RANGE}]`);
const KANJI_RE_GLOBAL = new RegExp(`[${KANJI_RANGE}]`, 'g');

export function hasKanji(input: string): boolean {
  return KANJI_RE.test(input);
}

export function extractKanji(input: string): string[] {
  return input.match(KANJI_RE_GLOBAL) || [];
}
