# Palmetto Weather — Claude Agent Guide

## Project Overview

Full-stack weather app: React frontend + NestJS backend. The backend proxies a weather API (raw HTTP, no SDK), normalizes data, and exposes a REST API. The frontend lets users search by location and displays current weather and forecast.

See `coding-challenge-outline.md` for requirements and `development-strategy.md` for approach.

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend  | NestJS, Node.js, TypeScript |
| Testing  | Vitest (both sides)     |
| HTTP     | Raw fetch/axios — no weather SDK wrappers |

## Repository Layout

```
palmetto-weather/
├── backend/
│   ├── src/
│   │   ├── weather/          # feature module (controller, service, module)
│   │   ├── types/            # shared TS interfaces
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── test/                 # Vitest specs
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── hooks/            # data-fetching hooks
│   │   ├── services/         # backend API client
│   │   ├── types/            # shared TS interfaces
│   │   └── test/             # Vitest specs
│   └── index.html
└── .claude/
    ├── api-contract.md       # agreed request/response shapes
    └── tasks.md              # current task list with acceptance criteria
```

## Coding Principles

- **Keep functions short and simple.** If a function is doing more than one thing, split it.
- **Check for an existing function before writing a new one.** Reuse and compose existing utilities rather than duplicating logic.
- **Check existing CSS before writing new styles.** Read root and component-level styles first; reuse classes and variables before adding anything new.
- **Frontend styling: Tailwind + shadcn/ui.** Use Tailwind utility classes for layout and spacing. Use shadcn/ui components (Button, Input, Card, etc.) before building custom ones. Do not write custom CSS unless Tailwind cannot express it.

## Architecture Rules

- Frontend and backend are **independently runnable** — no shared code across the boundary.
- Backend **must not** use any weather API SDK. Use `fetch` or `axios` directly.
- All business logic (unit conversion, summaries, enrichment) lives in `WeatherService`.
- Shared TypeScript types live in each app's own `src/types/` — do not share types across apps.
- Controllers only handle HTTP concerns; all logic belongs in services.

## API Contract

See `.claude/api-contract.md` for the full request/response shapes.

Base URL (dev): `http://localhost:3000`

| Method | Path                        | Description               |
|--------|-----------------------------|---------------------------|
| GET    | `/weather/current`          | Current weather for location |
| GET    | `/weather/forecast`         | Multi-day forecast        |

## Development Workflow (TDD)

1. Write a failing test describing the desired behavior.
2. Implement the minimum code to make it pass.
3. Refactor while keeping tests green.

Run tests:
```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test
```

## Task Guidance

See `.claude/tasks.md` for active tasks. Each task includes:
- What to implement
- Acceptance criteria (maps to tests)
- Edge cases to handle

When starting a task: write the spec first, then the implementation.
