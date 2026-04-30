import { FavoriteLocation } from "@/types/weather.types";
import { StarIcon } from "../icons/StarIcon";

interface Props {
  favorites: FavoriteLocation[];
  onSelect: (coords: string) => void;
}

export function FavoriteLocations({ favorites, onSelect }: Props) {
  if (favorites.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 items-center text-primary">
      {/* <StarIcon fill="currentColor" /> */}
      {favorites.map((fav) => (
        <button
          key={`${fav.coordinates.lat},${fav.coordinates.lon}`}
          onClick={() =>
            onSelect(`${fav.coordinates.lat},${fav.coordinates.lon}`)
          }
          className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          {fav.city}
          {fav.state ? `, ${fav.state}` : ""}
        </button>
      ))}
    </div>
  );
}
