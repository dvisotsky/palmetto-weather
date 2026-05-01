# Palmetto Weather

A full-stack weather app: React frontend + NestJS backend. The backend normalizes data from the OpenWeatherMap API; the frontend lets users search by location and displays current conditions and a multi-day forecast.

```
Browser
  └── React + Vite (localhost:5173)
        └── fetch() → NestJS API (localhost:3000)
              └── fetch() → OpenWeatherMap REST APIs
```

## Prerequisites

- Node.js 18+
- npm
- [OpenWeatherMap API key](https://openweathermap.org/api)

## Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

Set the backend environment variable:

```bash
export WEATHER_API_KEY=your_key_here
```

## Running

Start both servers (each in its own terminal):

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend && npm run start:dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

## API

| Method | Path                                                    | Description                         |
| ------ | ------------------------------------------------------- | ----------------------------------- |
| `GET`  | `/weather/locations?q=<city>`                           | Geocode a city → up to 5 candidates |
| `GET`  | `/weather/current?location=<city\|lat,lon>`             | Current conditions                  |
| `GET`  | `/weather/forecast?location=<city\|lat,lon>&days=<1-7>` | Daily forecast (default 5 days)     |

## Features

- **Location search with disambiguation** — autocomplete dropdown resolves city names to coordinates before fetching weather
- **Current conditions** — temperature (°F), feels-like, humidity, wind speed, and condition description
- **Multi-day forecast** — scrollable day cards with high/low temps, condition, and precipitation chance
- **Favorite locations** — star any location to persist it in localStorage for one-click access
- **Response caching** — in-memory cache (5 min current, 30 min forecast) keyed by rounded coordinates
