# Task Tracker

## Active Tasks

### 1. Backend — Weather proxy route (`GET /weather/current`)

**Goal:** Return normalized current weather for a given location.

**Acceptance criteria:**
- [x] Accepts `location` query param; returns 400 if missing
- [x] Calls external weather API via raw HTTP (no SDK)
- [x] Returns a consistent JSON shape (define once the weather API response is known)
- [x] Returns 502 with message when upstream API fails
- [x] `WeatherService` unit test covers success and error paths

**Edge cases:**
- Empty string location
- Upstream returns non-200
- Network timeout

---

### 2. Backend — Forecast route (`GET /weather/forecast`)

**Goal:** Return multi-day forecast for a location.

**Acceptance criteria:**
- [x] Accepts `location` query param; returns 400 if missing
- [x] Calls external weather API via raw HTTP (no SDK)
- [x] Returns a consistent JSON shape (define once the weather API response is known)
- [x] Returns 502 with message when upstream API fails

---

### 3. Frontend — Location search UI with disambiguation

**Goal:** User can type a city name, resolve it to a specific location, then trigger a weather lookup.

**Acceptance criteria:**
- [ ] `SearchBar` component renders an input and submit button
- [ ] On submit, calls `GET /weather/locations?q=...`
- [ ] If exactly 1 result → calls `onSearch` with `lat,lon` string immediately
- [ ] If >1 result → renders a `LocationPicker` dropdown listing candidates (`"Charleston, SC, US"`)
- [ ] User selects a candidate → calls `onSearch` with that candidate's `lat,lon`
- [ ] Disables button while request is in flight
- [ ] Shows inline error when input is empty on submit
- [ ] Shows inline error when locations API returns 0 results ("No locations found")
- [ ] Component tests cover: render, single-result auto-resolve, multi-result picker, no-results error, loading state

---

### 4. Frontend — Current weather display

**Goal:** Show normalized weather data returned from backend.

**Acceptance criteria:**
- [ ] `WeatherDisplay` renders the fields available from the backend response (define once API is known)
- [ ] Shows a loading skeleton while `isLoading` is true
- [ ] Shows error message when `error` prop is set
- [ ] Component test covers: loaded state, loading state, error state

---

### 5a. Frontend — Locations API hook

**Goal:** Encapsulate the `GET /weather/locations` call for use in `SearchBar`.

**Acceptance criteria:**
- [ ] `useLocations(query)` calls `GET /weather/locations?q={query}` when query is non-empty
- [ ] Exposes `{ locations, isLoading, error }`
- [ ] Does not fire when query is empty/blank

---

### 5b. Frontend — API integration hook

**Goal:** Wire `SearchBar` and `WeatherDisplay` together via `useWeather` hook.

**Acceptance criteria:**
- [ ] `useWeather(location)` calls `GET /weather/current`
- [ ] Exposes `{ data, isLoading, error }` 
- [ ] Re-fetches when location changes
- [ ] Clears stale data when a new search begins

---

## Side Quests
- [ ] Improve error handling
- [ ] Implement Swagger documentation

## Completed Tasks

### 0. Backend — Location search route (`GET /weather/locations`) ✓

### 1. Backend — Weather proxy route (`GET /weather/current`) ✓

### 2. Backend — Forecast route (`GET /weather/forecast`) ✓
