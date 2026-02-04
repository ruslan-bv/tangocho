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

# Start development servers
npm run dev
```

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
| `GET /api/decks` | List all decks |
| `POST /api/words` | Add word (auto-fetches data) |
| `GET /api/study/due` | Get cards due for review |
| `POST /api/study/review` | Submit review rating |
| `GET /api/jisho/search?q=` | Search Jisho dictionary |
| `GET /api/sentences/search?q=` | Search example sentences |

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
