import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { WeatherService } from '@/weather/weather.service';
import { BadRequestException, BadGatewayException } from '@nestjs/common';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile();

    service = module.get(WeatherService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLocations', () => {
    it('throws BadRequestException when q is empty', async () => {
      await expect(service.getLocations('')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when q is whitespace', async () => {
      await expect(service.getLocations('   ')).rejects.toThrow(BadRequestException);
    });

    it('returns mapped location candidates from geocoding API', async () => {
      const mockApiResponse = [
        { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
        { name: 'Charleston', state: 'West Virginia',  country: 'US', lat: 38.3498, lon: -81.6326 },
      ];
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      }));

      const result = await service.getLocations('Charleston');

      expect(result).toEqual([
        { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
        { name: 'Charleston', state: 'West Virginia',  country: 'US', lat: 38.3498, lon: -81.6326 },
      ]);
    });

    it('returns empty array when geocoding API finds no matches', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }));

      const result = await service.getLocations('xyznonexistentplace');

      expect(result).toEqual([]);
    });

    it('omits state field for non-US results that lack it', async () => {
      const mockApiResponse = [
        { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
      ];
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      }));

      const result = await service.getLocations('London');

      expect(result[0]).not.toHaveProperty('state');
      expect(result[0]).toMatchObject({ name: 'London', country: 'GB' });
    });

    it('throws BadGatewayException when geocoding API returns non-200', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }));

      await expect(service.getLocations('Charleston')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when fetch rejects (network error)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

      await expect(service.getLocations('Charleston')).rejects.toThrow(BadGatewayException);
    });
  });

  describe('getCurrent', () => {
    const mockGeoResponse = [
      { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
    ];

    const mockWeatherResponse = {
      current: {
        temp: 72,
        feels_like: 70,
        humidity: 65,
        wind_speed: 12,
        weather: [{ main: 'Clouds', description: 'few clouds' }],
      },
    };

    it('throws BadRequestException when location is empty', async () => {
      await expect(service.getCurrent('')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when location is whitespace', async () => {
      await expect(service.getCurrent('   ')).rejects.toThrow(BadRequestException);
    });

    it('geocodes city name and returns mapped weather response', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getCurrent('Charleston');

      expect(result).toMatchObject({
        location: 'Charleston, South Carolina',
        temperature: { value: 72, unit: 'F' },
        feelsLike: 70,
        humidity: 65,
        windSpeed: 12,
        windUnit: 'mph',
        condition: 'Clouds',
      });
      expect(result.summary).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('skips geocoding when location is lat,lon', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getCurrent('32.7765,-79.9311');

      expect(result).toMatchObject({
        temperature: { value: 72, unit: 'F' },
        feelsLike: 70,
        humidity: 65,
        windSpeed: 12,
        windUnit: 'mph',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws BadGatewayException when geocoding API returns non-200', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

      await expect(service.getCurrent('Charleston')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException when weather API returns non-200', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: false, status: 500 });
      vi.stubGlobal('fetch', fetchMock);

      await expect(service.getCurrent('Charleston')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException on network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

      await expect(service.getCurrent('Charleston')).rejects.toThrow(BadGatewayException);
    });
  });

  describe('getForecast', () => {
    it('throws BadRequestException when location is empty', async () => {
      await expect(service.getForecast('')).rejects.toThrow(BadRequestException);
    });
  });
});
