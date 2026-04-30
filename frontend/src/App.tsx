import { useState } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { WeatherDisplay } from './components/WeatherDisplay/WeatherDisplay';
import { useWeather } from './hooks/useWeather';

export default function App() {
  const [location, setLocation] = useState('');
  const { data, isLoading, error } = useWeather(location);

  return (
    <main>
      <h1>Palmetto Weather</h1>
      <SearchBar onSearch={setLocation} isLoading={isLoading} />
      <WeatherDisplay data={data} isLoading={isLoading} error={error} />
    </main>
  );
}
