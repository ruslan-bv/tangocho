import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDatabase } from './db/index.js';
import { authConfig } from './lib/auth/config.js';
import { attachUser } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { decksRouter } from './routes/decks.js';
import { wordsRouter } from './routes/words.js';
import { cardsRouter } from './routes/cards.js';
import { studyRouter } from './routes/study.js';
import { jishoRouter } from './routes/jisho.js';
import { immersionkitRouter } from './routes/immersionkit.js';
import { sentencesRouter } from './routes/sentences.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: authConfig.clientUrl, credentials: true }));
app.use(express.json());
app.use(attachUser);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/decks', decksRouter);
app.use('/api/words', wordsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/study', studyRouter);
app.use('/api/jisho', jishoRouter);
app.use('/api/immersionkit', immersionkitRouter);
app.use('/api/sentences', sentencesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler - catches errors from asyncHandler
interface HttpError extends Error {
  status?: number;
}

app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Error in ${req.method} ${req.path}:`, err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
