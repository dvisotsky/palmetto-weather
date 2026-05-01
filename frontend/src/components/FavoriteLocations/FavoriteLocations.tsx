import { useDragScroll } from "@/hooks/useDragScroll";
import { FavoriteLocation } from "@/types/weather.types";

interface Props {
  favorites: FavoriteLocation[];
  onSelect: (coords: string) => void;
}

export function FavoriteLocations({ favorites, onSelect }: Props) {
  const { ref, isScrollable, dragging, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useDragScroll<HTMLDivElement>();

  if (favorites.length === 0) return null;

  return (
    <div
      ref={ref}
      className={`flex gap-2 mt-3 items-center text-primary overflow-x-auto${isScrollable ? " cursor-grab" : ""}${dragging ? " cursor-grabbing select-none" : ""}`}
      style={{ scrollbarWidth: "none" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {favorites.map((fav) => (
        <button
          key={`${fav.coordinates.lat},${fav.coordinates.lon}`}
          onClick={() =>
            onSelect(`${fav.coordinates.lat},${fav.coordinates.lon}`)
          }
          className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
        >
          {fav.city}
          {fav.state ? `, ${fav.state}` : ""}
        </button>
      ))}
    </div>
  );
}
