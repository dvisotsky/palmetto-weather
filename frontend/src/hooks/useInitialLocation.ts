import { useEffect, useRef } from "react";
import { FavoriteLocation } from "@/types/weather.types";

const DEFAULT_COORDS = "64.145981,-21.9422367";

export function useInitialLocation(
  favorites: FavoriteLocation[],
  onResolved: (location: string) => void,
) {
  const onResolvedRef = useRef(onResolved);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  });

  useEffect(() => {
    const urlCoords = new URLSearchParams(window.location.search).get("q");
    if (urlCoords) {
      onResolvedRef.current(urlCoords);
      return;
    }

    const firstFavorite = favorites[0];
    const fallback = firstFavorite
      ? `${firstFavorite.coordinates.lat},${firstFavorite.coordinates.lon}`
      : DEFAULT_COORDS;

    if (!navigator.geolocation) {
      onResolvedRef.current(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onResolvedRef.current(`${coords.latitude},${coords.longitude}`);
      },
      () => {
        onResolvedRef.current(fallback);
      },
    );
  }, []);
}
