import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherDisplay } from '@/components/WeatherDisplay/WeatherDisplay';
import { CurrentWeather } from '@/types/weather.types';

const mockWeather: CurrentWeather = {
  city: 'Charleston',
  state: 'South Carolina',
  coordinates: { lat: 32.7765, lon: -79.9311 },
  temperature: { value: 72, unit: 'F' },
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  windUnit: 'mph',
  feelsLike: 70,
  description: 'few clouds',
};

const defaultProps = { forecast: null, forecastLoading: false };

describe('WeatherDisplay', () => {
  it('renders weather data when loaded', () => {
    render(<WeatherDisplay data={mockWeather} isLoading={false} error={null} {...defaultProps} />);
    expect(screen.getByText('Charleston')).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<WeatherDisplay data={null} isLoading error={null} {...defaultProps} />);
    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<WeatherDisplay data={null} isLoading={false} error="Service unavailable" {...defaultProps} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
  });

  it('renders nothing when no data and not loading', () => {
    const { container } = render(
      <WeatherDisplay data={null} isLoading={false} error={null} {...defaultProps} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
