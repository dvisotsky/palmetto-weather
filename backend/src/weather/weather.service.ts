import { BadGatewayException, BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  GeoLocation,
  CurrentWeatherResponse,
  ForecastDay,
  ForecastResponse,
} from "@/types/weather.types";
import { throwUpstreamError } from "@/utils/errors";

export function makeCacheKey(type: "current" | "forecast", lat: number, lon: number): string {
  return `${type}:${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function isGeoItems(data: unknown): data is any[] {
  return (
    Array.isArray(data) &&
    (data as any[]).every(
      (item: any) =>
        typeof item?.name === "string" &&
        typeof item?.country === "string" &&
        typeof item?.lat === "number" &&
        typeof item?.lon === "number",
    )
  );
}

function isWeatherPayload(data: unknown): data is any {
  const d = data as any;
  return (
    typeof d?.main?.temp === "number" &&
    typeof d?.main?.feels_like === "number" &&
    typeof d?.main?.humidity === "number" &&
    typeof d?.wind?.speed === "number" &&
    Array.isArray(d?.weather) &&
    d.weather.length > 0 &&
    typeof d.weather[0]?.main === "string" &&
    typeof d.weather[0]?.description === "string"
  );
}

function isForecastPayload(data: unknown): data is any {
  const d = data as any;
  return (
    Array.isArray(d?.list) &&
    d.list.length > 0 &&
    d.list.every(
      (slot: any) =>
        typeof slot?.dt_txt === "string" &&
        typeof slot?.main?.temp_max === "number" &&
        typeof slot?.main?.temp_min === "number" &&
        Array.isArray(slot?.weather) &&
        slot.weather.length > 0 &&
        typeof slot.weather[0]?.main === "string" &&
        typeof slot?.pop === "number",
    )
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const GEO_API = "https://api.openweathermap.org/geo/1.0/direct";
const REVERSE_GEO_API = "https://api.openweathermap.org/geo/1.0/reverse";
const WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_API = "https://api.openweathermap.org/data/2.5/forecast";
const API_KEY = process.env.OPENWEATHER_API_KEY ?? "";

const LAT_LON_RE = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

// TTLs in milliseconds (cache-manager v5)
const CURRENT_TTL_MS = 5 * 60 * 1000;
const FORECAST_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private malformedPayload(context: string, data: unknown): never {
    this.logger.error(
      `Malformed ${context} payload: ${JSON.stringify(data)}`,
    );
    throw new BadGatewayException("Malformed response from weather service");
  }

  private async getGeoLocations(
    q: string,
    limit: number,
  ): Promise<GeoLocation[]> {
    const url = `${GEO_API}?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
      const data: unknown = await res.json();
      if (!isGeoItems(data)) this.malformedPayload("geo", data);
      return data.map((item) => ({
        name: item.name as string,
        ...(item.state ? { state: item.state as string } : {}),
        country: item.country as string,
        lat: item.lat as number,
        lon: item.lon as number,
      }));
    } catch (err) {
      throwUpstreamError(err);
    }
  }

  private async reverseGeocode(
    lat: number,
    lon: number,
  ): Promise<GeoLocation | null> {
    const url = `${REVERSE_GEO_API}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`Reverse geocoding API error: ${res.status}`);
      const data: unknown = await res.json();
      if (!isGeoItems(data)) this.malformedPayload("reverse-geo", data);
      if (!data.length) return null;
      const item = data[0];
      return {
        name: item.name as string,
        ...(item.state ? { state: item.state as string } : {}),
        country: item.country as string,
        lat: item.lat as number,
        lon: item.lon as number,
      };
    } catch (err) {
      throwUpstreamError(err);
    }
  }

  async getLocations(q: string): Promise<GeoLocation[]> {
    if (!q?.trim()) {
      throw new BadRequestException("q is required");
    }
    return this.getGeoLocations(q.trim(), 5);
  }

  async getCurrent(location: string): Promise<CurrentWeatherResponse> {
    if (!location?.trim()) {
      throw new BadRequestException("location is required");
    }

    const trimmedLocation = location.trim();
    let lat: number;
    let lon: number;
    let city: string;
    let state: string;
    let country: string;

    try {
      if (LAT_LON_RE.test(trimmedLocation)) {
        [lat, lon] = trimmedLocation.split(",").map(Number);
        const geo = await this.reverseGeocode(lat, lon);
        city = geo?.name ?? "";
        state = geo?.state ?? "";
        country = geo?.country ?? "";
      } else {
        const [geo] = await this.getGeoLocations(trimmedLocation, 1);
        if (!geo) throw new BadRequestException("Location not found");
        lat = geo.lat;
        lon = geo.lon;
        city = geo.name;
        state = geo.state ?? "";
        country = geo.country;
      }

      const cacheKey = makeCacheKey("current", lat, lon);
      const cached = await this.cache.get<CurrentWeatherResponse>(cacheKey);
      if (cached) return cached;

      const weatherUrl = `${WEATHER_API}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok)
        throw new Error(`Weather API error: ${weatherRes.status}`);

      const data: unknown = await weatherRes.json();
      if (!isWeatherPayload(data)) this.malformedPayload("weather", data);

      const result: CurrentWeatherResponse = {
        city,
        state,
        country,
        coordinates: { lat, lon },
        temperature: { value: Math.round(data.main.temp), unit: "F" },
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        windUnit: "mph",
        condition: data.weather[0].main,
        description: data.weather[0].description,
      };

      await this.cache.set(cacheKey, result, CURRENT_TTL_MS);
      return result;
    } catch (err) {
      throwUpstreamError(err);
    }
  }

  async getForecast(
    location: string,
    days: number = 5,
  ): Promise<ForecastResponse> {
    if (!location?.trim()) {
      throw new BadRequestException("location is required");
    }

    const clampedDays = Math.min(Math.max(days, 1), 7);
    const trimmedLocation = location.trim();
    let lat: number;
    let lon: number;
    let city: string;
    let state: string;
    let country: string;

    try {
      if (LAT_LON_RE.test(trimmedLocation)) {
        [lat, lon] = trimmedLocation.split(",").map(Number);
        const geo = await this.reverseGeocode(lat, lon);
        city = geo?.name ?? "";
        state = geo?.state ?? "";
        country = geo?.country ?? "";
      } else {
        const [geo] = await this.getGeoLocations(trimmedLocation, 1);
        if (!geo) throw new BadRequestException("Location not found");
        lat = geo.lat;
        lon = geo.lon;
        city = geo.name;
        state = geo.state ?? "";
        country = geo.country;
      }

      const cacheKey = makeCacheKey("forecast", lat, lon);
      const cached = await this.cache.get<ForecastResponse>(cacheKey);
      if (cached) return cached;

      const url = `${FORECAST_API}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);

      const data: unknown = await res.json();
      if (!isForecastPayload(data)) this.malformedPayload("forecast", data);

      const byDate = new Map<string, typeof data.list>();
      for (const slot of data.list) {
        const date = slot.dt_txt.split(" ")[0];
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(slot);
      }

      const forecast: ForecastDay[] = Array.from(byDate.entries())
        .slice(0, clampedDays)
        .map(([date, slots]) => ({
          date,
          high: Math.round(Math.max(...slots.map((s: any) => s.main.temp_max))),
          low: Math.round(Math.min(...slots.map((s: any) => s.main.temp_min))),
          condition: (
            slots.find((s: any) => s.dt_txt.includes("12:00:00")) ?? slots[0]
          ).weather[0].main,
          precipitationChance: Math.round(
            Math.max(...slots.map((s: any) => s.pop)) * 100,
          ),
        }));

      const result: ForecastResponse = { city, state, country, coordinates: { lat, lon }, forecast };
      await this.cache.set(cacheKey, result, FORECAST_TTL_MS);
      return result;
    } catch (err) {
      throwUpstreamError(err);
    }
  }
}
