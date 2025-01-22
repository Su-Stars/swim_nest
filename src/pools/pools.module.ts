import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { CoordinateApiService } from 'src/coordinate-api/coordinate-api.service';
import { CoordinateApiModule } from 'src/coordinate-api/coordinate-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pools]),
    CoordinateApiModule
],
  controllers: [PoolsController],
  providers: [
    PoolsService,
  CoordinateApiService
  ],
  exports: [PoolsService]
})
export class PoolsModule {}
