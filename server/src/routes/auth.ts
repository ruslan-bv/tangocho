import { Router } from 'express';
import { randomBytes } from 'crypto';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { authConfig, assertGoogleAuthConfigured } from '../lib/auth/config.js';
import { clearCookie, parseCookies, setCookie } from '../lib/auth/cookies.js';
import {
  buildAuthorizeUrl,
  exchangeCodeForToken,
  fetchUserInfo,
  upsertGoogleUser,
} from '../lib/auth/google.js';
import {
  createSession,
  deleteSession,
} from '../lib/auth/sessions.js';

export const authRouter = Router();

authRouter.get('/google', asyncHandler(async (req, res) => {
  assertGoogleAuthConfigured();

  const state = randomBytes(24).toString('hex');
  setCookie(res, authConfig.csrf.cookieName, state, {
    maxAgeMs: authConfig.csrf.maxAgeMs,
    secure: authConfig.session.secure,
    sameSite: 'lax',
  });

  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '';
  if (returnTo) {
    setCookie(res, 'tangocho_return_to', returnTo, {
      maxAgeMs: authConfig.csrf.maxAgeMs,
      secure: authConfig.session.secure,
      sameSite: 'lax',
    });
  }

  res.redirect(buildAuthorizeUrl(state));
}));

authRouter.get('/google/callback', asyncHandler(async (req, res) => {
  assertGoogleAuthConfigured();

  const { code, state, error } = req.query;
  const cookies = parseCookies(req);
  const expectedState = cookies[authConfig.csrf.cookieName];
  const returnTo = cookies['tangocho_return_to'] || '/';

  clearCookie(res, authConfig.csrf.cookieName);
  clearCookie(res, 'tangocho_return_to');

  if (error) {
    return redirectToClient(res, `/login?error=${encodeURIComponent(String(error))}`);
  }

  if (!code || typeof code !== 'string') {
    return redirectToClient(res, '/login?error=missing_code');
  }

  if (!state || typeof state !== 'string' || state !== expectedState) {
    return redirectToClient(res, '/login?error=invalid_state');
  }

  const tokenResponse = await exchangeCodeForToken(code);
  const userInfo = await fetchUserInfo(tokenResponse.access_token);

  if (!userInfo.email) {
    return redirectToClient(res, '/login?error=missing_email');
  }

  const userId = await upsertGoogleUser(userInfo);
  const sessionToken = await createSession(userId);

  setCookie(res, authConfig.session.cookieName, sessionToken, {
    maxAgeMs: authConfig.session.maxAgeMs,
    secure: authConfig.session.secure,
    sameSite: 'lax',
  });

  const safePath = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
  redirectToClient(res, safePath);
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

function redirectToClient(res: import('express').Response, path: string): void {
  const base = authConfig.clientUrl.replace(/\/$/, '');
  res.redirect(`${base}${path.startsWith('/') ? path : `/${path}`}`);
}
