import { useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { SearchBar } from './components/SearchBar/SearchBar';
import { WeatherDisplay } from './components/WeatherDisplay/WeatherDisplay';
import { useWeather } from './hooks/useWeather';

export default function App() {
  const [location, setLocation] = useState('');
  const { data, isLoading, error } = useWeather(location);

  return (
    <Layout>
      <SearchBar onSearch={setLocation} isLoading={isLoading} />
      <WeatherDisplay data={data} isLoading={isLoading} error={error} />
    </Layout>
  );
}
