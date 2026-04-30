# API Contract

## GET /weather/locations

**Query params**

| Param | Type   | Required | Description                  |
|-------|--------|----------|------------------------------|
| q     | string | yes      | City name to search for      |

**Success 200**

```json
[
  { "name": "Charleston", "state": "South Carolina", "country": "US", "lat": 32.7765, "lon": -79.9311 },
  { "name": "Charleston", "state": "West Virginia",  "country": "US", "lat": 38.3498, "lon": -81.6326 }
]
```

**Error 400** — missing `q` param

```json
{ "statusCode": 400, "message": "q is required" }
```

**Error 502** — upstream geocoding API failure

```json
{ "statusCode": 502, "message": "Weather service unavailable" }
```

---

## GET /weather/current

**Query params**

| Param    | Type   | Required | Description             |
|----------|--------|----------|-------------------------|
| location | string | yes      | City name or lat,lon    |

**Success 200**

```json
{
  "city": "Charleston",
  "state": "South Carolina",
  "coordinates": { "lat": 32.7765, "lon": -79.9311 },
  "temperature": {
    "value": 72,
    "unit": "F"
  },
  "condition": "Partly Cloudy",
  "humidity": 65,
  "windSpeed": 12,
  "windUnit": "mph",
  "feelsLike": 70,
  "description": "few clouds"
}
```

**Error 400** — missing or invalid location param

```json
{ "statusCode": 400, "message": "location is required" }
```

**Error 502** — upstream weather API failure

```json
{ "statusCode": 502, "message": "Weather service unavailable" }
```

---

## GET /weather/forecast

**Query params**

| Param    | Type   | Required | Description             |
|----------|--------|----------|-------------------------|
| location | string | yes      | City name or lat,lon    |
| days     | number | no       | Number of days (default 5, max 7) |

**Success 200**

```json
{
  "city": "Charleston",
  "state": "South Carolina",
  "coordinates": { "lat": 32.7765, "lon": -79.9311 },
  "forecast": [
    {
      "date": "2026-05-01",
      "high": 78,
      "low": 62,
      "condition": "Sunny",
      "precipitationChance": 10
    }
  ]
}
```

**Error shapes** same as `/weather/current`.
