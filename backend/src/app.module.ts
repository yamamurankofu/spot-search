import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotsModule } from './spots/spots.module';
import { Spot } from './spots/spot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5433,
      username: process.env.DB_USER || 'landit_user',
      password: process.env.DB_PASSWORD || 'landit_password',
      database: process.env.DB_NAME || 'spot_search_db',
      entities: [Spot],  
      synchronize: false,
    }),
    SpotsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}