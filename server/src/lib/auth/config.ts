export const authConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  session: {
    cookieName: 'tangocho_session',
    maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
  },
  csrf: {
    cookieName: 'tangocho_oauth_state',
    maxAgeMs: 10 * 60 * 1000, // 10 minutes
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
} as const;

export function assertGoogleAuthConfigured(): void {
  if (!authConfig.google.clientId || !authConfig.google.clientSecret) {
    throw new Error(
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.'
    );
  }
}
