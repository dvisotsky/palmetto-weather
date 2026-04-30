import { BadRequestException, Injectable, BadGatewayException } from '@nestjs/common';
import { GeoLocation, CurrentWeatherResponse, ForecastResponse } from '@/types/weather.types';

const GEO_API = 'https://api.openweathermap.org/geo/1.0/direct';
const ONE_CALL_API = 'https://api.openweathermap.org/data/3.0/onecall';
const API_KEY = process.env.OPENWEATHER_API_KEY ?? '';

const LAT_LON_RE = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

@Injectable()
export class WeatherService {
  async getLocations(q: string): Promise<GeoLocation[]> {

    if (!q?.trim()) {
      throw new BadRequestException('q is required');
    }

    const url = `${GEO_API}?q=${encodeURIComponent(q.trim())}&limit=5&appid=${API_KEY}`;

    let data: Record<string, unknown>[];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
      data = (await res.json()) as Record<string, unknown>[];
    } catch (err) {
      throw new BadGatewayException('Weather service unavailable');
    }

    return data.map((item) => ({
      name: item.name as string,
      ...(item.state ? { state: item.state as string } : {}),
      country: item.country as string,
      lat: item.lat as number,
      lon: item.lon as number,
    }));
  }

  async getCurrent(location: string): Promise<CurrentWeatherResponse> {
    if (!location?.trim()) {
      throw new BadRequestException('location is required');
    }

    const trimmed = location.trim();
    let lat: number;
    let lon: number;
    let locationLabel: string;

    try {
      if (LAT_LON_RE.test(trimmed)) {
        [lat, lon] = trimmed.split(',').map(Number);
        locationLabel = trimmed;
      } else {
        const geoUrl = `${GEO_API}?q=${encodeURIComponent(trimmed)}&limit=1&appid=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error(`Geocoding error: ${geoRes.status}`);
        const [geo] = (await geoRes.json()) as Record<string, unknown>[];
        lat = geo.lat as number;
        lon = geo.lon as number;
        locationLabel = geo.state ? `${geo.name}, ${geo.state}` : `${geo.name}`;
      }

      const weatherUrl = `${ONE_CALL_API}?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`;
      const weatherRes = await fetch(weatherUrl);
      if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
      const data = (await weatherRes.json()) as { current: Record<string, unknown> };
      const current = data.current;
      const weather = (current.weather as { main: string; description: string }[])[0];

      return {
        location: locationLabel,
        temperature: { value: Math.round(current.temp as number), unit: 'F' },
        feelsLike: Math.round(current.feels_like as number),
        humidity: current.humidity as number,
        windSpeed: Math.round(current.wind_speed as number),
        windUnit: 'mph',
        condition: weather.main,
        summary: `${weather.description.charAt(0).toUpperCase()}${weather.description.slice(1)} with a temperature of ${Math.round(current.temp as number)}°F.`,
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadGatewayException('Weather service unavailable');
    }
  }

  async getForecast(location: string, days: number = 5): Promise<ForecastResponse> {
    if (!location?.trim()) {
      throw new BadRequestException('location is required');
    }

    const clampedDays = Math.min(Math.max(days, 1), 7);

    // TODO: implement raw HTTP call to weather API
    throw new Error('Not implemented');
  }
}
