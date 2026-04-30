import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherDisplay } from '@/components/WeatherDisplay/WeatherDisplay';
import { CurrentWeather } from '@/types/weather.types';

const mockWeather: CurrentWeather = {
  location: 'Charleston, SC',
  temperature: { value: 72, unit: 'F' },
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  windUnit: 'mph',
  feelsLike: 70,
  summary: 'A pleasant afternoon.',
};

describe('WeatherDisplay', () => {
  it('renders weather data when loaded', () => {
    render(<WeatherDisplay data={mockWeather} isLoading={false} error={null} />);
    expect(screen.getByText('Charleston, SC')).toBeInTheDocument();
    expect(screen.getByText(/72°F/)).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<WeatherDisplay data={null} isLoading error={null} />);
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<WeatherDisplay data={null} isLoading={false} error="Service unavailable" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
  });

  it('renders nothing when no data and not loading', () => {
    const { container } = render(
      <WeatherDisplay data={null} isLoading={false} error={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
