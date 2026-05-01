import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForecast } from '@/hooks/useForecast';
import { fetchForecast } from '@/services/weatherApi';
import { Forecast } from '@/types/weather.types';

vi.mock('@/services/weatherApi', () => ({
  fetchForecast: vi.fn(),
}));

const mockForecast: Forecast = {
  city: 'Charleston',
  state: 'South Carolina',
  country: 'US',
  coordinates: { lat: 32.7765, lon: -79.9311 },
  forecast: [
    { date: '2026-05-01', high: 80, low: 65, condition: 'Sunny', precipitationChance: 10 },
  ],
};

describe('useForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when location is empty', () => {
    renderHook(() => useForecast(''));
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  it('returns loading then forecast data on success', async () => {
    vi.mocked(fetchForecast).mockResolvedValue(mockForecast);
    const { result } = renderHook(() => useForecast('32.7765,-79.9311'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockForecast);
    expect(result.current.error).toBeNull();
  });

  it('returns error state when fetch fails', async () => {
    vi.mocked(fetchForecast).mockRejectedValue(new Error('Service unavailable'));
    const { result } = renderHook(() => useForecast('32.7765,-79.9311'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.data).toBeNull();
  });

  it('passes the days argument to fetchForecast', async () => {
    vi.mocked(fetchForecast).mockResolvedValue(mockForecast);
    renderHook(() => useForecast('32.7765,-79.9311', 7));

    await waitFor(() => expect(fetchForecast).toHaveBeenCalledWith('32.7765,-79.9311', 7));
  });

  it('clears stale data and re-fetches when location changes', async () => {
    vi.mocked(fetchForecast).mockResolvedValue(mockForecast);
    const { result, rerender } = renderHook(({ loc }) => useForecast(loc), {
      initialProps: { loc: '32.7765,-79.9311' },
    });

    await waitFor(() => expect(result.current.data).toEqual(mockForecast));

    rerender({ loc: '38.3498,-81.6326' });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
