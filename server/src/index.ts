import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './db/index.js';
import { initTokenizer } from './lib/japanese/tokenize.js';
import { authConfig } from './lib/auth/config.js';
import { deleteExpiredSessions } from './lib/auth/sessions.js';
import { attachUser } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { decksRouter } from './routes/decks.js';
import { wordsRouter } from './routes/words.js';
import { importRouter } from './routes/import.js';
import { cardsRouter } from './routes/cards.js';
import { studyRouter } from './routes/study.js';
import { jishoRouter } from './routes/jisho.js';
import { immersionkitRouter } from './routes/immersionkit.js';
import { sentencesRouter } from './routes/sentences.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: authConfig.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(attachUser);

// Rate limits: generous global cap, strict on auth (bcrypt cost),
// moderate on endpoints that fan out to external APIs
const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});
const upstreamLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down' },
});

app.use('/api', globalLimiter);
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);
app.use(['/api/jisho', '/api/sentences', '/api/immersionkit', '/api/import'], upstreamLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/decks', decksRouter);
app.use('/api/words', wordsRouter);
app.use('/api/import', importRouter);
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
  const status = err.status || 500;
  // Hide internal details (driver/upstream messages) for unexpected errors
  res.status(status).json({
    message: status < 500 && err.message ? err.message : 'Internal server error'
  });
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');

    initTokenizer().then(
      () => console.log('Japanese tokenizer ready'),
      (err) => console.error('Tokenizer init failed:', err)
    );

    // Garbage-collect expired sessions on startup and hourly thereafter
    const cleanupSessions = () =>
      deleteExpiredSessions().catch((err) => console.error('Session cleanup failed:', err));
    cleanupSessions();
    setInterval(cleanupSessions, 60 * 60 * 1000).unref();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
