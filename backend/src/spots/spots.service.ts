import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot)
    private spotRepository: Repository<Spot>,
  ) {}

  async findNearby(lat: number, lng: number, radius: number): Promise<Spot[]> {
    const radiusInMeters = radius * 1000; // kmをメートルに変換

    const query = `
      SELECT 
        id,
        name,
        category,
        lat,
        long,
        address,
        ST_Distance(
          location,
          ST_MakePoint($1, $2)::GEOGRAPHY
        ) / 1000 AS distance_km
      FROM spots
      WHERE ST_DWithin(
        location,
        ST_MakePoint($1, $2)::GEOGRAPHY,
        $3
      )
      ORDER BY distance_km ASC
    `;

    const results = await this.spotRepository.query(query, [lng, lat, radiusInMeters]);
    return results;
  }
}