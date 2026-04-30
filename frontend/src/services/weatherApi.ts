import { CurrentWeather, Forecast } from '@/types/weather.types';

const BASE_URL = '/weather';

export async function fetchCurrentWeather(location: string): Promise<CurrentWeather> {
  const res = await fetch(`${BASE_URL}/current?location=${encodeURIComponent(location)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchForecast(location: string, days = 5): Promise<Forecast> {
  const res = await fetch(
    `${BASE_URL}/forecast?location=${encodeURIComponent(location)}&days=${days}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
