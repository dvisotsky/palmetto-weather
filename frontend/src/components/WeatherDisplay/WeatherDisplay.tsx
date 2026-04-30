import { CurrentWeather, Forecast } from "@/types/weather.types";

interface Props {
  data: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
  forecast: Forecast | null;
  forecastLoading: boolean;
}

export function WeatherDisplay({ data, isLoading, error, forecast, forecastLoading }: Props) {
  if (isLoading) {
    return <div aria-busy="true">Loading weather data…</div>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <section aria-label="Current weather">
        <h1 className="font-header font-bold text-4xl">{data.city}</h1>
        <h1 className="font-header font-bold text-xl">{data.state}</h1>
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
      </section>
      <section aria-label="Forecast">
        <h2 className="font-header font-bold text-2xl mt-8 mb-4">Forecast</h2>
        {forecastLoading && <div aria-busy="true">Loading forecast…</div>}
        {forecast && (
          <ul className="flex flex-col gap-2">
            {forecast.forecast.map((day) => (
              <li key={day.date} className="flex items-center gap-6">
                <span className="font-header font-semibold w-28">{day.date}</span>
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
    </>
  );
}
