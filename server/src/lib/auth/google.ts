import { authConfig } from './config.js';
import { pool } from '../../db/index.js';
import { ensureDefaultDeck } from '../../db/index.js';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export function buildAuthorizeUrl(state: string): string {
  const { google } = authConfig;
  const params = new URLSearchParams({
    client_id: google.clientId,
    redirect_uri: google.redirectUri,
    response_type: 'code',
    scope: google.scopes.join(' '),
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${google.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const { google } = authConfig;
  const body = new URLSearchParams({
    code,
    client_id: google.clientId,
    client_secret: google.clientSecret,
    redirect_uri: google.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(google.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Google token exchange failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(authConfig.google.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Google userinfo fetch failed (${response.status})`);
  }

  return response.json() as Promise<GoogleUserInfo>;
}

export async function upsertGoogleUser(info: GoogleUserInfo): Promise<number> {
  const name = info.name || info.given_name || info.email;
  const avatar = info.picture ?? null;

  const { rows } = await pool.query(
    `INSERT INTO users (google_id, email, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = NOW()
     RETURNING id`,
    [info.sub, info.email, name, avatar]
  );

  const userId = rows[0].id as number;
  await ensureDefaultDeck(userId);
  return userId;
}
