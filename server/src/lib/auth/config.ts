export const authConfig = {
  session: {
    cookieName: 'tangocho_session',
    maxAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
} as const;
