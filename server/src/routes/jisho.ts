import { Router } from 'express';
import { jishoClient } from '../lib/jisho.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';

export const jishoRouter = Router();

jishoRouter.use(requireAuth);

// Search Jisho
jishoRouter.get('/search',
  validateQuery('q', 'Search query is required'),
  asyncHandler(async (req, res) => {
    const query = (req.query.q as string).trim();
    const results = await jishoClient.search(query);
    res.json({ data: results });
  })
);
