import { BadRequestException, Injectable } from '@nestjs/common';
import { GeoLocation, CurrentWeatherResponse, ForecastDay, ForecastResponse } from '@/types/weather.types';
import { throwUpstreamError } from '@/utils/errors';

const GEO_API = 'https://api.openweathermap.org/geo/1.0/direct';
const REVERSE_GEO_API = 'https://api.openweathermap.org/geo/1.0/reverse';
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';
const API_KEY = process.env.OPENWEATHER_API_KEY ?? '';

const LAT_LON_RE = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

@Injectable()
export class WeatherService {
  private async getGeoLocations(q: string, limit: number): Promise<GeoLocation[]> {
    const url = `${GEO_API}?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
      const data = (await res.json()) as Record<string, unknown>[];
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

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `${REVERSE_GEO_API}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Reverse geocoding API error: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>[];
    if (!data.length) return `${lat},${lon}`;
    const item = data[0];
    return item.state ? `${item.name as string}, ${item.state as string}` : (item.name as string);
  }

  async getLocations(q: string): Promise<GeoLocation[]> {
    if (!q?.trim()) {
      throw new BadRequestException('q is required');
    }
    return this.getGeoLocations(q.trim(), 5);
  }

  async getCurrent(location: string): Promise<CurrentWeatherResponse> {
    if (!location?.trim()) {
      throw new BadRequestException('location is required');
    }

    const trimmedLocation = location.trim();
    let lat: number;
    let lon: number;
    let locationLabel: string;

    try {
      if (LAT_LON_RE.test(trimmedLocation)) {
        [lat, lon] = trimmedLocation.split(',').map(Number);
        locationLabel = await this.reverseGeocode(lat, lon);
      } else {
        const [geo] = await this.getGeoLocations(trimmedLocation, 1);
        if (!geo) throw new BadRequestException('Location not found');
        lat = geo.lat;
        lon = geo.lon;
        locationLabel = geo.state ? `${geo.name}, ${geo.state}` : geo.name;
      }

      const weatherUrl = `${WEATHER_API}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);

      const data = (await weatherRes.json()) as {
        main: { temp: number; feels_like: number; humidity: number };
        wind: { speed: number };
        weather: { main: string; description: string }[];
      };
      const weather = data.weather[0];

      return {
        location: locationLabel,
        coordinates: { lat, lon },
        temperature: { value: Math.round(data.main.temp), unit: 'F' },
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        windUnit: 'mph',
        condition: weather.main,
        description: weather.description,
      };
    } catch (err) {
      throwUpstreamError(err);
    }
  }

  async getForecast(location: string, days: number = 5): Promise<ForecastResponse> {
    if (!location?.trim()) {
      throw new BadRequestException('location is required');
    }

    const clampedDays = Math.min(Math.max(days, 1), 7);
    const trimmedLocation = location.trim();
    let lat: number;
    let lon: number;
    let locationLabel: string;

    try {
      if (LAT_LON_RE.test(trimmedLocation)) {
        [lat, lon] = trimmedLocation.split(',').map(Number);
        locationLabel = await this.reverseGeocode(lat, lon);
      } else {
        const [geo] = await this.getGeoLocations(trimmedLocation, 1);
        if (!geo) throw new BadRequestException('Location not found');
        lat = geo.lat;
        lon = geo.lon;
        locationLabel = geo.state ? `${geo.name}, ${geo.state}` : geo.name;
      }

      const url = `${FORECAST_API}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);

      const data = (await res.json()) as {
        list: {
          dt_txt: string;
          main: { temp_max: number; temp_min: number };
          weather: { main: string }[];
          pop: number;
        }[];
      };

      const byDate = new Map<string, typeof data.list>();
      for (const slot of data.list) {
        const date = slot.dt_txt.split(' ')[0];
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(slot);
      }

      const forecast: ForecastDay[] = Array.from(byDate.entries())
        .slice(0, clampedDays)
        .map(([date, slots]) => ({
          date,
          high: Math.round(Math.max(...slots.map((s) => s.main.temp_max))),
          low: Math.round(Math.min(...slots.map((s) => s.main.temp_min))),
          condition: (slots.find((s) => s.dt_txt.includes('12:00:00')) ?? slots[0]).weather[0].main,
          precipitationChance: Math.round(Math.max(...slots.map((s) => s.pop)) * 100),
        }));

      return { location: locationLabel, coordinates: { lat, lon }, forecast };
    } catch (err) {
      throwUpstreamError(err);
    }
  }
}
