import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { CoordinateApiService } from 'src/coordinate-api/coordinate-api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pools]),
    HttpModule
],
  controllers: [PoolsController],
  providers: [
    PoolsService,
  CoordinateApiService
  ],
  exports: [
    PoolsService
  ,CoordinateApiService
  ]
})
export class PoolsModule {}
