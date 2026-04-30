import { useEffect, useState } from 'react';
import { Forecast } from '@/types/weather.types';
import { fetchForecast } from '@/services/weatherApi';

interface ForecastState {
  data: Forecast | null;
  isLoading: boolean;
  error: string | null;
}

export function useForecast(location: string, days = 5): ForecastState {
  const [state, setState] = useState<ForecastState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!location) return;

    let cancelled = false;

    setState({ data: null, isLoading: true, error: null });

    fetchForecast(location, days)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, isLoading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [location, days]);

  return state;
}
