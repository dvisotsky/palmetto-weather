import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { GeoLocation, CurrentWeatherResponse, ForecastResponse } from '@/types/weather.types';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('locations')
  getLocations(@Query('q') q: string): Promise<GeoLocation[]> {
    return this.weatherService.getLocations(q);
  }

  @Get('current')
  getCurrent(@Query('location') location: string): Promise<CurrentWeatherResponse> {
    return this.weatherService.getCurrent(location);
  }

  @Get('forecast')
  getForecast(
    @Query('location') location: string,
    @Query('days') days?: string,
  ): Promise<ForecastResponse> {
    return this.weatherService.getForecast(location, days ? parseInt(days, 10) : 5);
  }
}
