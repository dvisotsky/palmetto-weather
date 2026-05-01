import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useWeather } from '@/hooks/useWeather';
import { fetchCurrentWeather } from '@/services/weatherApi';
import { CurrentWeather } from '@/types/weather.types';

vi.mock('@/services/weatherApi', () => ({
  fetchCurrentWeather: vi.fn(),
}));

const mockWeather: CurrentWeather = {
  city: 'Charleston',
  state: 'South Carolina',
  country: 'US',
  coordinates: { lat: 32.7765, lon: -79.9311 },
  temperature: { value: 72, unit: 'F' },
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  windUnit: 'mph',
  feelsLike: 70,
  description: 'few clouds',
};

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when location is empty', () => {
    renderHook(() => useWeather(''));
    expect(fetchCurrentWeather).not.toHaveBeenCalled();
  });

  it('returns loading then data on success', async () => {
    vi.mocked(fetchCurrentWeather).mockResolvedValue(mockWeather);
    const { result } = renderHook(() => useWeather('32.7765,-79.9311'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockWeather);
    expect(result.current.error).toBeNull();
  });

  it('returns error state when fetch fails', async () => {
    vi.mocked(fetchCurrentWeather).mockRejectedValue(new Error('Service unavailable'));
    const { result } = renderHook(() => useWeather('32.7765,-79.9311'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.data).toBeNull();
  });

  it('clears stale data and starts loading when location changes', async () => {
    vi.mocked(fetchCurrentWeather).mockResolvedValue(mockWeather);
    const { result, rerender } = renderHook(({ loc }) => useWeather(loc), {
      initialProps: { loc: '32.7765,-79.9311' },
    });

    await waitFor(() => expect(result.current.data).toEqual(mockWeather));

    rerender({ loc: '38.3498,-81.6326' });

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('ignores a stale response when location changes before it resolves', async () => {
    const staleWeather: CurrentWeather = { ...mockWeather, city: 'Stale City' };
    const freshWeather: CurrentWeather = { ...mockWeather, city: 'Fresh City' };

    let resolveStale!: (v: CurrentWeather) => void;
    vi.mocked(fetchCurrentWeather)
      .mockReturnValueOnce(new Promise((r) => { resolveStale = r; }))
      .mockResolvedValueOnce(freshWeather);

    const { result, rerender } = renderHook(({ loc }) => useWeather(loc), {
      initialProps: { loc: 'loc1' },
    });

    rerender({ loc: 'loc2' });
    await waitFor(() => expect(result.current.data).toEqual(freshWeather));

    resolveStale(staleWeather);
    await waitFor(() => expect(result.current.data).toEqual(freshWeather));
  });
});
