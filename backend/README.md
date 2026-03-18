# Backend — NASA Dashboard

Express.js API that proxies NASA endpoints, normalises the data, and adds server-side pagination and caching.

## Tech

- [Express](https://expressjs.com) v5
- [Helmet](https://helmetjs.github.io/) for security headers
- [Winston](https://github.com/winstonjs/winston) for structured logging
- [Zod](https://zod.dev/) for query parameter validation via middleware
- [AI SDK](https://sdk.vercel.ai/) with [Google Gemini](https://ai.google.dev/) for the summary endpoint
- In-memory caching per date range — no Redis required
- Rate limiting via `express-rate-limit`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/apod` | Astronomy Picture of the Day |
| `GET` | `/api/neo` | Near Earth Objects (paginated or full) |
| `GET` | `/api/flr` | Solar flare events (paginated) |
| `GET` | `/api/summary` | AI-generated summary (Gemini) |

## Environment Variables

Create a `.env` file in this directory:

```env
NASA_API_KEY=your_nasa_api_key        # Falls back to DEMO_KEY in development
GEMINI_API_KEY=your_gemini_api_key    # Required in production
PORT=4000
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000           # Optional, default 15 min
RATE_LIMIT_MAX=100                    # Optional, default 100 requests per window
```

## Scripts

```bash
pnpm dev              # Start dev server (nodemon + tsx)
pnpm build            # Compile TypeScript
pnpm start            # Start production server
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

## Installation

```bash
pnpm install
cp .env.example .env  # Then fill in your keys
pnpm dev
```

Runs on `http://localhost:4000`.
