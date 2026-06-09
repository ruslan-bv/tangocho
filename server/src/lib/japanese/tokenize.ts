import path from 'node:path';
import { createRequire } from 'node:module';
import kuromoji, { type IpadicFeatures, type Tokenizer } from 'kuromoji';
import { hasKanji } from './kanji.js';

export interface ContentWord {
  surface: string;
  lemma: string;
  reading: string;
  pos: string;
}

const require = createRequire(import.meta.url);
const DIC_PATH = path.join(path.dirname(require.resolve('kuromoji/package.json')), 'dict');

let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

function loadTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: DIC_PATH }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
    });
  }
  return tokenizerPromise;
}

export function initTokenizer(): Promise<unknown> {
  return loadTokenizer();
}

const NOUN_DETAILS = new Set(['一般', 'サ変接続', '形容動詞語幹', '副詞可能', '固有名詞']);

const POS_FILTERS: Record<string, (detail: string) => boolean> = {
  '名詞': (d) => NOUN_DETAILS.has(d),
  '動詞': (d) => d === '自立',
  '形容詞': (d) => d === '自立',
};

function shouldKeep(token: IpadicFeatures): boolean {
  return POS_FILTERS[token.pos]?.(token.pos_detail_1) ?? false;
}

function katakanaToHiragana(input: string): string {
  return input.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

export async function tokenize(text: string): Promise<ContentWord[]> {
  const tokenizer = await loadTokenizer();
  const tokens = tokenizer.tokenize(text);

  const words: ContentWord[] = [];
  for (const t of tokens) {
    if (!shouldKeep(t)) continue;

    const lemma = t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form;
    if (!lemma) continue;

    // kuromoji reading is for the surface form, so trust it only when not lemmatized.
    let reading = '';
    if (t.surface_form === lemma) {
      const readingSource = t.reading && t.reading !== '*' ? t.reading : '';
      reading = readingSource ? katakanaToHiragana(readingSource) : hasKanji(lemma) ? '' : lemma;
    }

    words.push({ surface: t.surface_form, lemma, reading, pos: t.pos });
  }
  return words;
}

export function uniqueByLemma(words: ContentWord[]): ContentWord[] {
  const seen = new Set<string>();
  const out: ContentWord[] = [];
  for (const w of words) {
    if (seen.has(w.lemma)) continue;
    seen.add(w.lemma);
    out.push(w);
  }
  return out;
}
