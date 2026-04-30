# Development Strategy for Palmetto Weather

## TDD with Vitest

- Start each feature from a failing test.
- Use `vitest` as the test runner and assertion library for both frontend and backend.
- Keep tests small and focused:
  - frontend: component rendering, user interactions, loading/error states
  - backend: API route behavior, weather service logic, error handling flows
- Follow the red-green-refactor loop:
  1. write a test for the desired behavior
  2. make the test pass with minimal implementation
  3. refactor code while keeping tests green
- Prefer behavior-driven test descriptions that document expected outcomes.
- Use mocks for external API calls so tests remain deterministic and fast.

## Architecture Guidance

- Keep frontend and backend separately deployed and independently testable.
- Frontend responsibilities:
  - user input and location search
  - calling backend API endpoints
  - rendering current weather, forecast, and error states
  - exposing a clear loading/error experience
- Backend responsibilities:
  - proxy weather API requests without SDK wrappers
  - normalize and enrich raw data with app-specific summaries
  - handle caching, rate limits, and API failures cleanly
  - expose a simple, well-documented REST contract
- Structure the backend with:
  - controllers/routes for HTTP handling
  - services for weather API integration and business logic
  - shared types/interfaces for request/response data shapes
- Structure the frontend with:
  - composable UI components
  - a service layer or hooks for API calls
  - well-defined state and side-effect management
- Plan an API contract with example request and response shapes before implementation.
- Include error-handling flows on both sides:
  - backend: validation, external API failures, and fallback behavior
  - frontend: user feedback, retry options, and disabled states

## Task-Focused AI Agent Reference

- Define goals for each task with explicit acceptance criteria.
- Use task groups such as:
  1. implement backend weather API proxy
  2. create frontend search UI and API integration
  3. add error handling and loading states
  4. write unit and integration tests for critical paths
- For each task, include:
  - what to implement
  - how to verify success (tests, manual behavior)
  - any constraints or edge cases to consider
- Example task format:
  - Task: "Backend weather proxy route"
  - Goal: "Return normalized weather data for a given location"
  - Acceptance criteria:
    - accepts location input
    - calls external weather API directly
    - responds with a predictable JSON shape
    - handles API errors with proper status codes
- Keep tasks small enough to complete in one work session.
- Prefer incremental delivery: finish one backend or UI slice, then add tests and improve.
- Track known limitations or future work explicitly so AI agents can prioritize what remains.
