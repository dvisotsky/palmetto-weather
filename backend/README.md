# Palmetto Weather — Backend

NestJS REST API that proxies a weather service and exposes normalized weather data.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

Set the required environment variable:

```bash
export WEATHER_API_KEY=your_key_here
```

## Running

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start
```

The server starts on `http://localhost:3000`.

## API

| Method | Path                | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/weather/current`  | Current weather (`?location=...`)  |
| GET    | `/weather/forecast` | Multi-day forecast (`?location=...&days=5`) |

See [`.claude/api-contract.md`](../.claude/api-contract.md) for full request/response shapes.

## Testing

```bash
npm test          # run once
npm run test:watch  # watch mode
```
