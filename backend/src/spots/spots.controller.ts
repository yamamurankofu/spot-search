import { Controller, Get, Query } from '@nestjs/common';
import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('nearby')
  async getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius) || 5; // デフォルト5km

    if (isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Invalid latitude or longitude' };
    }

    const spots = await this.spotsService.findNearby(latitude, longitude, radiusKm);
    return spots;
  }
}