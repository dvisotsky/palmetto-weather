import { useState } from 'react';
import { Coordinates, FavoriteLocation } from '@/types/weather.types';

const STORAGE_KEY = 'palmetto_favorites';

function loadFromStorage(): FavoriteLocation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function coordsMatch(a: Coordinates, b: Coordinates) {
  return a.lat === b.lat && a.lon === b.lon;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(loadFromStorage);

  function persist(updated: FavoriteLocation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFavorites(updated);
  }

  function isFavorite(coords: Coordinates) {
    return favorites.some((f) => coordsMatch(f.coordinates, coords));
  }

  function toggleFavorite(location: FavoriteLocation) {
    if (isFavorite(location.coordinates)) {
      persist(favorites.filter((f) => !coordsMatch(f.coordinates, location.coordinates)));
    } else {
      persist([...favorites, location]);
    }
  }

  return { favorites, isFavorite, toggleFavorite };
}
