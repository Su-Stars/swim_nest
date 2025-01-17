import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pools])],
  controllers: [PoolsController],
  providers: [PoolsService],
})
export class PoolsModule {}
