import { describe, it, expect, vi, beforeEach } from "vitest";
import { Test } from "@nestjs/testing";
import { WeatherController } from "@/weather/weather.controller";
import { WeatherService } from "@/weather/weather.service";
import { CurrentWeatherResponse } from "@/types/weather.types";

describe("WeatherController", () => {
  let controller: WeatherController;
  let service: WeatherService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getLocations: vi.fn(),
            getCurrent: vi.fn(),
            getForecast: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WeatherController);
    service = module.get(WeatherService);
  });

  it("delegates getLocations to service", async () => {
    const mockLocations = [
      {
        name: "Charleston",
        state: "South Carolina",
        country: "US",
        lat: 32.7765,
        lon: -79.9311,
      },
    ];
    vi.mocked(service.getLocations).mockResolvedValue(mockLocations);

    const result = await controller.getLocations("Charleston");

    expect(service.getLocations).toHaveBeenCalledWith("Charleston");
    expect(result).toBe(mockLocations);
  });

  it("delegates getCurrent to service", async () => {
    const mockData: CurrentWeatherResponse = {
      city: "Charleston",
      state: "SC",
      country: "US",
      coordinates: { lat: 32.7765, lon: -79.9311 },
      temperature: { value: 72, unit: "F" },
      condition: "Clouds",
      humidity: 65,
      windSpeed: 12,
      windUnit: "mph",
      feelsLike: 70,
      description: "few clouds",
    };
    vi.mocked(service.getCurrent).mockResolvedValue(mockData);

    const result = await controller.getCurrent("Charleston, SC");

    expect(service.getCurrent).toHaveBeenCalledWith("Charleston, SC");
    expect(result).toBe(mockData);
  });
});
