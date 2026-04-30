export interface Location {
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export interface Temperature {
  value: number;
  unit: 'F' | 'C';
}

export interface CurrentWeather {
  location: string;
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

export interface Forecast {
  location: string;
  forecast: ForecastDay[];
}
