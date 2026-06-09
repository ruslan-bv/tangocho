import { Router } from 'express';
import { pool } from '../db/index.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateIntBody, validateTrimmedBody } from '../middleware/validate.js';
import { badRequest, notFound } from '../lib/responses.js';
import { tokenize, uniqueByLemma } from '../lib/japanese/tokenize.js';
import { jishoClient } from '../lib/jisho.js';
import { withConcurrency } from '../lib/concurrency.js';
import { userOwnsDeck } from '../lib/decks.js';
import {
  createWordWithCard,
  type CreateFailureReason,
} from '../lib/words/createWordWithCard.js';

export const importRouter = Router();

importRouter.use(requireAuth);

const MAX_TEXT_LENGTH = 5000;
const MAX_PARSE_LEMMAS = 100;
const MAX_BULK_LEMMAS = 50;
const PARSE_CONCURRENCY = 4;
const BULK_CONCURRENCY = 4;

importRouter.post(
  '/parse',
  validateTrimmedBody('text', 'Text is required'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const text: string = req.body.text;
    const deckId: number | undefined =
      typeof req.body.deckId === 'number' ? req.body.deckId : undefined;

    if (text.length > MAX_TEXT_LENGTH) {
      return badRequest(res, `Text must be ${MAX_TEXT_LENGTH} characters or fewer`);
    }
    if (deckId !== undefined && !(await userOwnsDeck(userId, deckId))) {
      return notFound(res, 'Deck');
    }

    const unique = uniqueByLemma(await tokenize(text)).slice(0, MAX_PARSE_LEMMAS);
    const lemmas = unique.map((w) => w.lemma);

    let inDeck = new Set<string>();
    if (deckId !== undefined && lemmas.length > 0) {
      const { rows } = await pool.query<{ japanese: string }>(
        `SELECT w.japanese
         FROM cards c JOIN words w ON w.id = c.word_id
         WHERE c.user_id = $1 AND c.deck_id = $2 AND w.japanese = ANY($3::text[])`,
        [userId, deckId, lemmas]
      );
      inDeck = new Set(rows.map((r) => r.japanese));
    }

    const previews = await withConcurrency(lemmas, PARSE_CONCURRENCY, async (lemma) => {
      try {
        return await jishoClient.getPreview(lemma);
      } catch {
        return null;
      }
    });

    const words = unique.map((w, i) => ({
      surface: w.surface,
      lemma: w.lemma,
      reading: w.reading || previews[i]?.reading || '',
      pos: w.pos,
      alreadyInDeck: inDeck.has(w.lemma),
      jishoPreview: previews[i],
    }));

    res.json({ words });
  })
);

interface BulkResult {
  lemma: string;
  ok: boolean;
  cardId?: number;
  reason?: CreateFailureReason | 'error';
}

importRouter.post(
  '/bulk',
  validateIntBody('deckId'),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const deckId: number = req.body.deckId;
    const lemmas: string[] = Array.isArray(req.body.lemmas) ? req.body.lemmas : [];

    if (lemmas.length === 0) {
      return badRequest(res, 'lemmas must be a non-empty array');
    }
    if (lemmas.length > MAX_BULK_LEMMAS) {
      return badRequest(res, `At most ${MAX_BULK_LEMMAS} words at a time`);
    }
    if (!(await userOwnsDeck(userId, deckId))) {
      return notFound(res, 'Deck');
    }

    const results = await withConcurrency<string, BulkResult>(
      lemmas,
      BULK_CONCURRENCY,
      async (lemma) => {
        try {
          const r = await createWordWithCard(userId, deckId, lemma);
          return r.ok
            ? { lemma, ok: true, cardId: r.card.id }
            : { lemma, ok: false, reason: r.reason };
        } catch (err) {
          console.error(`bulk import failed for "${lemma}":`, err);
          return { lemma, ok: false, reason: 'error' };
        }
      }
    );

    res.json({ results });
  })
);
