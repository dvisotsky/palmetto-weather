import { useEffect, useState } from 'react';
import { CurrentWeather } from '@/types/weather.types';
import { fetchCurrentWeather } from '@/services/weatherApi';

interface WeatherState {
  data: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeather(location: string): WeatherState {
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!location) return;

    let cancelled = false;

    setState({ data: null, isLoading: true, error: null });

    fetchCurrentWeather(location)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, isLoading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return state;
}
