import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { WeatherService, makeCacheKey } from '@/weather/weather.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, BadGatewayException, Logger } from '@nestjs/common';

describe('makeCacheKey', () => {
  it('prefixes with type and rounds coords to 2 decimal places', () => {
    expect(makeCacheKey('current', 32.7765, -79.9311)).toBe('current:32.78,-79.93');
    expect(makeCacheKey('forecast', 32.7765, -79.9311)).toBe('forecast:32.78,-79.93');
  });

  it('produces the same key for coordinates that round identically', () => {
    expect(makeCacheKey('current', 32.779, -79.934)).toBe(makeCacheKey('current', 32.7765, -79.9311));
  });

  it('handles negative coordinates', () => {
    expect(makeCacheKey('current', -33.87, 151.21)).toBe('current:-33.87,151.21');
  });
});

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const mockCache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
    };
    const module = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
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

    it('logs and throws BadGatewayException when geo API returns malformed payload', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'Charleston' }]), // missing country, lat, lon
      }));
      const logSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getLocations('Charleston')).rejects.toThrow(BadGatewayException);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed geo payload'));
    });
  });

  describe('getCurrent', () => {
    const mockGeoResponse = [
      { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
    ];

    const mockWeatherResponse = {
      main: { temp: 72, feels_like: 70, humidity: 65 },
      wind: { speed: 12 },
      weather: [{ main: 'Clouds', description: 'few clouds' }],
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
        city: 'Charleston',
        state: 'South Carolina',
        country: 'US',
        temperature: { value: 72, unit: 'F' },
        feelsLike: 70,
        humidity: 65,
        windSpeed: 12,
        windUnit: 'mph',
        condition: 'Clouds',
      });
      expect(result.description).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('reverse geocodes lat,lon coordinates to populate city and state', async () => {
      const mockReverseGeoResponse = [
        { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
      ];
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockReverseGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeatherResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getCurrent('32.7765,-79.9311');

      expect(result).toMatchObject({
        city: 'Charleston',
        state: 'South Carolina',
        country: 'US',
        temperature: { value: 72, unit: 'F' },
        feelsLike: 70,
        humidity: 65,
        windSpeed: 12,
        windUnit: 'mph',
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('throws BadRequestException when geocoding returns no results', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }));

      await expect(service.getCurrent('xyznotaplace')).rejects.toThrow(BadRequestException);
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

    it('logs and throws BadGatewayException when geo API returns malformed payload', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'Charleston' }]), // missing country, lat, lon
      }));
      const logSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getCurrent('Charleston')).rejects.toThrow(BadGatewayException);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed geo payload'));
    });

    it('logs and throws BadGatewayException when weather API returns malformed payload', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ main: { temp: 72 } }) }); // missing wind, weather
      vi.stubGlobal('fetch', fetchMock);
      const logSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getCurrent('Charleston')).rejects.toThrow(BadGatewayException);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed weather payload'));
    });
  });

  describe('getForecast', () => {
    const mockGeoResponse = [
      { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
    ];

    const mockForecastResponse = {
      list: [
        { dt_txt: '2026-05-01 09:00:00', main: { temp_max: 75, temp_min: 60 }, weather: [{ main: 'Clouds' }], pop: 0.1 },
        { dt_txt: '2026-05-01 12:00:00', main: { temp_max: 78, temp_min: 62 }, weather: [{ main: 'Sunny' }], pop: 0.2 },
        { dt_txt: '2026-05-01 15:00:00', main: { temp_max: 80, temp_min: 63 }, weather: [{ main: 'Clouds' }], pop: 0.3 },
        { dt_txt: '2026-05-02 09:00:00', main: { temp_max: 70, temp_min: 55 }, weather: [{ main: 'Rain' }], pop: 0.8 },
        { dt_txt: '2026-05-02 12:00:00', main: { temp_max: 72, temp_min: 57 }, weather: [{ main: 'Rain' }], pop: 0.6 },
      ],
    };

    it('throws BadRequestException when location is empty', async () => {
      await expect(service.getForecast('')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when location is whitespace', async () => {
      await expect(service.getForecast('   ')).rejects.toThrow(BadRequestException);
    });

    it('geocodes city name and returns grouped daily forecast', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockForecastResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getForecast('Charleston');

      expect(result.city).toBe('Charleston');
      expect(result.state).toBe('South Carolina');
      expect(result.country).toBe('US');
      expect(result.forecast).toHaveLength(2);
      expect(result.forecast[0]).toEqual({
        date: '2026-05-01',
        high: 80,
        low: 60,
        condition: 'Sunny',
        precipitationChance: 30,
      });
      expect(result.forecast[1]).toMatchObject({
        date: '2026-05-02',
        high: 72,
        low: 55,
        condition: 'Rain',
        precipitationChance: 80,
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('reverse geocodes lat,lon coordinates to populate city and state', async () => {
      const mockReverseGeoResponse = [
        { name: 'Charleston', state: 'South Carolina', country: 'US', lat: 32.7765, lon: -79.9311 },
      ];
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockReverseGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockForecastResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getForecast('32.7765,-79.9311');

      expect(result.city).toBe('Charleston');
      expect(result.state).toBe('South Carolina');
      expect(result.country).toBe('US');
      expect(result.forecast).toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('limits results to requested days count', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockForecastResponse) });
      vi.stubGlobal('fetch', fetchMock);

      const result = await service.getForecast('Charleston', 1);

      expect(result.forecast).toHaveLength(1);
    });

    it('throws BadGatewayException when forecast API returns non-200', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: false, status: 500 });
      vi.stubGlobal('fetch', fetchMock);

      await expect(service.getForecast('Charleston')).rejects.toThrow(BadGatewayException);
    });

    it('throws BadGatewayException on network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

      await expect(service.getForecast('Charleston')).rejects.toThrow(BadGatewayException);
    });

    it('logs and throws BadGatewayException when geo API returns malformed payload', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ name: 'Charleston' }]), // missing country, lat, lon
      }));
      const logSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getForecast('Charleston')).rejects.toThrow(BadGatewayException);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed geo payload'));
    });

    it('logs and throws BadGatewayException when forecast API returns malformed payload', async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeoResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ list: [{ dt_txt: '2026-05-01 12:00:00' }] }) }); // slots missing main, weather, pop
      vi.stubGlobal('fetch', fetchMock);
      const logSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getForecast('Charleston')).rejects.toThrow(BadGatewayException);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Malformed forecast payload'));
    });
  });
});
