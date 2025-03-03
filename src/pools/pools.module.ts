import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolImages, Pools } from './pools.entity';
import { CoordinateApiService } from '../coordinate-api/coordinate-api.service';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from '../common/middleware/auth.middleware';
import { AuthModule } from '../auth/auth.module';
import { ImagesModule } from '../images/images.module';
import { ImagesService } from '../images/images.service';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { ReviewsModule } from "../reviews/reviews.module";
import { ReviewsService } from "../reviews/reviews.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Pools, PoolImages]),
    HttpModule,
    AuthModule,
    ImagesModule,
    ReviewsModule,
    forwardRef(() => BookmarksModule),
  ],
  controllers: [PoolsController],
  providers: [PoolsService, CoordinateApiService,ImagesService, ReviewsService],
  exports: [PoolsService, CoordinateApiService, TypeOrmModule],
})
export class PoolsModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
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
        {
          path: 'api/v1/pools/images/:poolId',
          method: RequestMethod.PUT,
        },
        {
          path: 'api/v1/pools/:poolId/reviews',
          method: RequestMethod.GET
        }
      )
      .forRoutes(PoolsController);
  }
}
