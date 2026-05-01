import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteLocation } from '@/types/weather.types';

const STORAGE_KEY = 'palmetto_favorites';

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

const charleston: FavoriteLocation = {
  city: 'Charleston',
  state: 'South Carolina',
  coordinates: { lat: 32.7765, lon: -79.9311 },
};

const huntington: FavoriteLocation = {
  city: 'Huntington',
  state: 'West Virginia',
  coordinates: { lat: 38.4192, lon: -82.4452 },
};

describe('useFavorites', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('starts with an empty list when storage is empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('isFavorite returns false for a location not in the list', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite(charleston.coordinates)).toBe(false);
  });

  it('toggleFavorite adds a location', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(charleston));

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toEqual(charleston);
  });

  it('isFavorite returns true after adding a location', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(charleston));

    expect(result.current.isFavorite(charleston.coordinates)).toBe(true);
  });

  it('toggleFavorite removes a location already in the list', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(charleston));
    act(() => result.current.toggleFavorite(charleston));

    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite(charleston.coordinates)).toBe(false);
  });

  it('can hold multiple favorites independently', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(charleston));
    act(() => result.current.toggleFavorite(huntington));

    expect(result.current.favorites).toHaveLength(2);

    act(() => result.current.toggleFavorite(charleston));

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(huntington.coordinates)).toBe(true);
    expect(result.current.isFavorite(charleston.coordinates)).toBe(false);
  });

  it('persists favorites to localStorage on toggle', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite(charleston));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual([charleston]);
  });

  it('loads existing favorites from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([charleston]));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([charleston]);
    expect(result.current.isFavorite(charleston.coordinates)).toBe(true);
  });

  it('starts with empty list when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json');

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
  });
});
