import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateQuery } from '../middleware/validate.js';
import { immersionKitSentenceProvider } from '../lib/sentences/index.js';
import { config } from '../config.js';

export const immersionkitRouter = Router();

// Search Immersion Kit for example sentences
immersionkitRouter.get('/search',
  validateQuery('q', 'Search query is required'),
  asyncHandler(async (req, res) => {
    const query = (req.query.q as string).trim();
    const limit = Math.min(
      parseInt(req.query.limit as string) || config.limits.defaultSentences,
      config.api.immersionkit.maxLimit
    );

    const sentences = await immersionKitSentenceProvider.search(query, limit);
    res.json({ examples: sentences });
  })
);
