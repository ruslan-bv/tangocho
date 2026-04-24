# Tangocho (単語帳)

A Japanese vocabulary learning application with spaced repetition, inspired by Anki but designed to be more user-friendly.

When you add a new word, Tangocho automatically fetches translations, readings, kanji information, and example sentences from multiple sources.

## Features

- **Smart Word Lookup** - Add Japanese words and automatically get readings, meanings, JLPT level, and parts of speech from Jisho
- **Kanji Details** - View stroke count, readings (on'yomi/kun'yomi), and meanings for each kanji
- **Example Sentences** - Fetch sentences from Tatoeba and Immersion Kit (anime/media)
- **Spaced Repetition** - SM-2 algorithm schedules reviews at optimal intervals
- **Deck Organization** - Organize vocabulary into custom decks
- **Multilingual UI** - Interface available in Japanese, English, and Russian

## Tech Stack

| Frontend | Backend |
|----------|---------|
| SvelteKit 2 + Svelte 5 | Express.js |
| TypeScript | PostgreSQL |
| Vite | Node.js 20+ |

## Prerequisites

- Node.js 20+
- PostgreSQL

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tangocho.git
cd tangocho

# Install dependencies
npm install

# Setup database (creates 'tangocho' database)
npm run db:check

# Configure Google OAuth (see "Authentication" below)
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-client-secret

# Start development servers
npm run dev
```

## Authentication

Tangocho uses Google OAuth for sign-in. Each user's decks, words, cards, and
reviews are scoped to their account.

**Setup**

1. Create an OAuth 2.0 Client in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add `http://localhost:3000/api/auth/google/callback` as an authorized redirect URI.
3. Export the credentials before running the server:

   ```bash
   export GOOGLE_CLIENT_ID=...
   export GOOGLE_CLIENT_SECRET=...
   # optional overrides
   export GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   export CLIENT_URL=http://localhost:5173
   ```

Sessions are stored server-side in Postgres and issued via an HTTP-only cookie.

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
tangocho/
├── client/          # SvelteKit frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/         # API client
│   │   │   ├── components/  # Svelte components
│   │   │   ├── i18n/        # Translations
│   │   │   └── stores/      # State management
│   │   ├── routes/          # Page routes
│   │   └── styles/          # Theme CSS
│   └── ...
├── server/          # Express.js backend
│   ├── src/
│   │   ├── db/              # Database schema
│   │   ├── lib/             # API clients, SRS algorithm
│   │   ├── middleware/      # Express middleware
│   │   └── routes/          # API endpoints
│   └── ...
└── package.json     # Workspace root
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/auth/google` | Start Google OAuth flow |
| `GET /api/auth/me` | Current signed-in user |
| `POST /api/auth/logout` | End the current session |
| `GET /api/decks` | List your decks |
| `POST /api/words` | Add word (auto-fetches data) |
| `GET /api/study/due` | Get cards due for review |
| `POST /api/study/review` | Submit review rating |
| `GET /api/jisho/search?q=` | Search Jisho dictionary |
| `GET /api/sentences/search?q=` | Search example sentences |

All data endpoints require an authenticated session.

## External APIs

Tangocho integrates with these free APIs:

- [Jisho.org](https://jisho.org) - Dictionary lookups
- [Tatoeba](https://tatoeba.org) - Example sentences
- [Kanjiapi.dev](https://kanjiapi.dev) - Kanji details
- [Immersion Kit](https://immersionkit.com) - Sentences from anime/media

## Design

The UI follows a Japanese aesthetic theme inspired by **wabi-sabi** (侘寂) principles:

- Minimal ornamentation
- Generous whitespace
- Soft, paper-like shadows
- Color palette: sumi ink, washi paper, indigo accents

Fonts: Noto Sans JP, Noto Serif JP

## Scripts

```bash
npm run dev          # Run both frontend and backend
npm run dev:client   # Run frontend only
npm run dev:server   # Run backend only
npm run db:check     # Verify/create database
npm run build        # Build for production
```

## License

MIT
