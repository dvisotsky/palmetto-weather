import {
  Coordinates,
  CurrentWeather,
  FavoriteLocation,
  Forecast,
} from "@/types/weather.types";
import { Button } from "../Button/Button";
import { Loading } from "../Loading/Loading";
import { StarIcon } from "../icons/StarIcon";

interface Props {
  data: CurrentWeather | null;
  currentWeatherLoading: boolean;
  error: string | null;
  forecast: Forecast | null;
  forecastLoading: boolean;
  isFavorite: (coords: Coordinates) => boolean;
  toggleFavorite: (location: FavoriteLocation) => void;
}

export function WeatherDisplay({
  data,
  currentWeatherLoading,
  error,
  forecast,
  forecastLoading,
  isFavorite,
  toggleFavorite,
}: Props) {
  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!data) {
    return null;
  }

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  function getRegion() {
    if (data?.state) return data.state;
    if (data?.country) return regionNames.of(data?.country);
    return "";
  }
  const region = getRegion();

  return (
    <>
      <div className="py-4 border-b-4 border-primary flex items-end gap-4">
        <h1 className="font-header font-bold text-4xl">
          {data?.city}
          {region ? "," : ""}
        </h1>
        {region && (
          <h1 className="font-header font-bold text-2xl italic">{region}</h1>
        )}
        {data && (
          <Button
            variant="icon"
            onClick={() =>
              toggleFavorite({
                city: data.city,
                state: data.state,
                coordinates: data.coordinates,
              })
            }
          >
            <StarIcon
              fill={isFavorite(data.coordinates) ? "currentColor" : "none"}
            />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <section aria-label="Current weather">
          <h2 className="font-header font-bold text-2xl mt-8 mb-4">
            Current Weather
          </h2>
          {currentWeatherLoading && <Loading label="Loading weather data…" />}
          {data && (
            <>
              <p>
                {data.temperature.value}°{data.temperature.unit}
              </p>
              <p>{data.condition}</p>
              <p>Feels like {data.feelsLike}°</p>
              <p>Humidity: {data.humidity}%</p>
              <p>
                Wind: {data.windSpeed} {data.windUnit}
              </p>
              <p>{data.description}</p>
            </>
          )}
        </section>
        <section aria-label="Forecast">
          <h2 className="font-header font-bold text-2xl mt-8 mb-4">Forecast</h2>
          {forecastLoading && <Loading label="Loading forecast…" />}
          {forecast && (
            <ul className="flex flex-col gap-2">
              {forecast.forecast.map((day) => (
                <li key={day.date} className="flex items-center gap-6">
                  <span className="font-header font-semibold w-28">
                    {new Date(day.date).toLocaleString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>{day.condition}</span>
                  <span>
                    {day.high}° / {day.low}°
                  </span>
                  <span>{day.precipitationChance}% precip</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
