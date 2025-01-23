import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from "@nestjs/common";
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { CoordinateApiService } from 'src/coordinate-api/coordinate-api.service';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from '../common/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pools]),
    HttpModule,
    AuthModule,
    forwardRef(() => BookmarksModule),
  ],
  controllers: [PoolsController],
  providers: [PoolsService, CoordinateApiService],
  exports: [PoolsService, CoordinateApiService, TypeOrmModule],
})
export class PoolsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: 'api/v1/pools',
          method: RequestMethod.GET,
        },
        {
          path: 'api/v1/pools/:poolId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes(PoolsController);
  }
}
