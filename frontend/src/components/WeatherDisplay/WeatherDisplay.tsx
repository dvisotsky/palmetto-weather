import {
  Coordinates,
  CurrentWeather,
  FavoriteLocation,
  Forecast,
} from "@/types/weather.types";
import { Button } from "../Button/Button";
import { Loading } from "../Loading/Loading";
import { StarIcon } from "../icons/StarIcon";
import { startCase } from "lodash";

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
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">
          <h1 className="font-header font-bold text-4xl">
            {data?.city}
            {region ? <span className="hidden sm:inline">,</span> : ""}
          </h1>
          {region && (
            <h1 className="font-header font-bold text-2xl italic">{region}</h1>
          )}
        </div>
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

      <div className="flex sm:flex-row flex-col mt-8 sm:divide-x-4 divide-primary-light">
        <section aria-label="Current weather" className="pr-4 mb-8 sm:mb-0">
          <h2 className="font-header font-bold text-2xl mb-4">
            Current Weather
          </h2>
          {currentWeatherLoading && <Loading label="Loading weather data…" />}
          {data && (
            <div className="text-xl">
              <div className="flex items-end gap-4">
                <p className="flex items-start">
                  <span className="text-4xl font-bold">
                    {data.temperature.value}
                  </span>
                  °{data.temperature.unit}
                </p>
                <p>
                  <span className="italic text-lg">Feels like</span>{" "}
                  {data.feelsLike}°
                </p>
              </div>
              <p className="text-2xl font-bold">
                {startCase(data.description)}
              </p>
              <div className="mt-4 text-lg">
                <p>Humidity: {data.humidity}%</p>
                <p>
                  Wind: {data.windSpeed} {data.windUnit}
                </p>
              </div>
            </div>
          )}
        </section>
        <section aria-label="Forecast" className="sm:pl-4 flex-1">
          <h2 className="font-header font-bold text-2xl mb-4">Forecast</h2>
          {forecastLoading && <Loading label="Loading forecast…" />}
          {forecast && (
            <ul className="grid grid-flow-col gap-2 overflow-x-auto auto-cols-[minmax(7rem,1fr)] sm:auto-cols-fr border-x-2 border-primary-light sm:border-x-0">
              {forecast.forecast.map((day) => {
                const date = new Date(`${day.date}T00:00:00`);
                return (
                  <li key={day.date} className="flex flex-col gap-1 mx-2">
                    <div>
                      <div className="font-header font-bold">
                        {date.toLocaleString("en-US", { weekday: "long" })}
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        {date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <span className="font-semibold">
                      &uarr;{day.high}° &darr;{day.low}°
                    </span>
                    <span>{day.condition}</span>
                    <span className="text-sm">
                      {day.precipitationChance}% precip
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
