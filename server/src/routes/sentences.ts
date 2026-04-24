import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { sentenceAggregator } from '../lib/sentences/index.js';
import { config } from '../config.js';

export const sentencesRouter = Router();

sentencesRouter.use(requireAuth);

// Search for example sentences (Tatoeba first, Immersion Kit fallback)
sentencesRouter.get('/search',
  validateQuery('q', 'Search query is required'),
  asyncHandler(async (req, res) => {
    const query = (req.query.q as string).trim();
    const limit = Math.min(
      parseInt(req.query.limit as string) || config.limits.defaultSentences,
      config.limits.defaultSentences
    );

    const result = await sentenceAggregator.search(query, limit);
    res.json(result);
  })
);
