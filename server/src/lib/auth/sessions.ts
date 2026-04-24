import { randomBytes } from 'crypto';
import { pool } from '../../db/index.js';
import { authConfig } from './config.js';

export interface SessionUser {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + authConfig.session.maxAgeMs);
  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt.toISOString()]
  );
  return token;
}

export async function getSessionUser(token: string): Promise<SessionUser | null> {
  const { rows } = await pool.query(
    `SELECT u.id, u.google_id, u.email, u.name, u.avatar_url
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    googleId: row.google_id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE id = $1', [token]);
}

export async function deleteExpiredSessions(): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
}
