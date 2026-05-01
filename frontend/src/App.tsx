import { useState, useEffect } from "react";
import { Layout } from "./components/Layout/Layout";
import { SearchBar } from "./components/SearchBar/SearchBar";
import { FavoriteLocations } from "./components/FavoriteLocations/FavoriteLocations";
import { WeatherDisplay } from "./components/WeatherDisplay/WeatherDisplay";
import { useWeather } from "./hooks/useWeather";
import { useForecast } from "./hooks/useForecast";
import { useFavorites } from "./hooks/useFavorites";
import { useInitialLocation } from "./hooks/useInitialLocation";

export default function App() {
  const [location, setLocation] = useState("");
  const { data, isLoading, error } = useWeather(location);
  const { data: forecast, isLoading: forecastLoading } = useForecast(location);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  useInitialLocation(favorites, setLocation);

  useEffect(() => {
    if (!location) return;
    window.history.replaceState(null, "", `?q=${location}`);
  }, [location]);

  return (
    <Layout>
      <SearchBar onSearch={setLocation} isLoading={isLoading} />
      <FavoriteLocations favorites={favorites} onSelect={setLocation} />
      <WeatherDisplay
        data={data}
        currentWeatherLoading={isLoading}
        error={error}
        forecast={forecast}
        forecastLoading={forecastLoading}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
      />
    </Layout>
  );
}
