import type { Request, Response, NextFunction } from 'express';
import { authConfig } from '../lib/auth/config.js';
import { parseCookies } from '../lib/auth/cookies.js';
import { getSessionUser, type SessionUser } from '../lib/auth/sessions.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: SessionUser;
  }
}

export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const cookies = parseCookies(req);
  const token = cookies[authConfig.session.cookieName];
  if (!token) return next();

  try {
    const user = await getSessionUser(token);
    if (user) req.user = user;
  } catch (err) {
    console.error('Failed to resolve session:', err);
  }
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  next();
}
