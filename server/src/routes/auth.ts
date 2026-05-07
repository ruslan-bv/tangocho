import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { authConfig } from '../lib/auth/config.js';
import { clearCookie, parseCookies, setCookie } from '../lib/auth/cookies.js';
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
} from '../lib/auth/passwords.js';
import { pool, ensureDefaultDeck } from '../db/index.js';
import { createSession, deleteSession } from '../lib/auth/sessions.js';

export const authRouter = Router();

interface CredentialsBody {
  email?: unknown;
  password?: unknown;
  name?: unknown;
}

function parseCredentials(body: CredentialsBody): { email: string; password: string; name: string } | null {
  if (!body || typeof body !== 'object') return null;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!email || !password) return null;
  return { email, password, name };
}

function issueSession(res: import('express').Response, token: string): void {
  setCookie(res, authConfig.session.cookieName, token, {
    maxAgeMs: authConfig.session.maxAgeMs,
    secure: authConfig.session.secure,
    sameSite: 'lax',
  });
}

authRouter.post('/register', asyncHandler(async (req, res) => {
  const creds = parseCredentials(req.body);
  if (!creds) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (!isValidEmail(creds.email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }
  if (creds.password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    });
  }

  const passwordHash = await hashPassword(creds.password);
  const displayName = creds.name || creds.email.split('@')[0];

  let userId: number;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [creds.email, passwordHash, displayName]
    );
    userId = rows[0].id as number;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    throw err;
  }

  await ensureDefaultDeck(userId);
  const token = await createSession(userId);
  issueSession(res, token);

  res.status(201).json({
    id: userId,
    email: creds.email,
    name: displayName,
    avatarUrl: null,
  });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const creds = parseCredentials(req.body);
  if (!creds) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { rows } = await pool.query(
    'SELECT id, email, name, avatar_url, password_hash FROM users WHERE email = $1',
    [creds.email]
  );
  const row = rows[0];

  // Run verifyPassword even if no row, to keep timing similar.
  const dummyHash = '$2b$12$0000000000000000000000000000000000000000000000000000';
  const ok = await verifyPassword(creds.password, row?.password_hash ?? dummyHash);

  if (!row || !ok) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = await createSession(row.id);
  issueSession(res, token);

  res.json({
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  });
}));

authRouter.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  });
});

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const cookies = parseCookies(req);
  const token = cookies[authConfig.session.cookieName];
  if (token) await deleteSession(token);
  clearCookie(res, authConfig.session.cookieName);
  res.status(204).send();
}));
