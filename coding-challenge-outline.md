# Palmetto Programming Challenge — Weather App

## Objective

Build a React application that prompts for a location and displays relevant weather information. The project is open-ended; use it to demonstrate problem-solving, creativity, and production-level engineering judgment.

Submit via a **public GitHub repo** or **.zip file** with setup documentation.

---

## Tech Stack

| Layer | Required | Preferred |
|-------|----------|-----------|
| Frontend | **React** | — |
| Backend runtime | **Node.js** | **NestJS** |
| Testing | — | **Vitest** |

---

## Weather API

Use any free weather API and make **direct REST calls** (no SDK wrappers). Options include:

- [OpenWeatherMap](https://openweathermap.org/current) — 1,000 calls/day, 60/min
- [AccuWeather](https://apidev.accuweather.com/developers) — 50 calls/day
- [Weather.gov](https://weather.gov/documentation/services-web-api) — no key required
- [Other public APIs](https://github.com/public-apis/public-apis?tab=readme-ov-file#weather)

---

## Evaluation Criteria

### Code Quality
- Readable, maintainable code
- Well-organized reusable components and modules
- Clear, consistent function and variable naming

### Architecture
- Scalable API design that supports future expansion
- Business logic beyond a simple API passthrough — add value to the raw data

### Testing
- Unit/integration tests (Vitest preferred)
- Coverage of meaningful paths

### Error Handling
- Graceful failure on both frontend and backend
- Strategy for tracking and responding to errors in production

### Production Readiness
- What's implemented (or planned) to make this deployable and maintainable?
- API documentation (Swagger preferred)

### Developer Experience
- Tested, minimal setup steps to run on a fresh machine
- Clear README with all necessary instructions

---

## Constraints

1. **No API wrapper packages** — make raw HTTP calls to the weather API directly. Libraries for HTTP requests and JSON parsing are fine.
2. **AI tools are allowed**, but you must be able to fully explain every line of code submitted. Don't include anything you can't walk through and defend.
