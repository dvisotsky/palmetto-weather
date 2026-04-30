import { CurrentWeather } from "@/types/weather.types";

interface Props {
  data: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
}

export function WeatherDisplay({ data, isLoading, error }: Props) {
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
  );
}
