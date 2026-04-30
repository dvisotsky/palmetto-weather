export interface GeoLocation {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Temperature {
  value: number;
  unit: 'F' | 'C';
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface CurrentWeatherResponse {
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  temperature: Temperature;
  condition: string;
  humidity: number;
  windSpeed: number;
  windUnit: string;
  feelsLike: number;
  description: string;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
}

export interface ForecastResponse {
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  forecast: ForecastDay[];
}
