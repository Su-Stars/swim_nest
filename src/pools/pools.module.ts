import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools.entity';
import { CoordinateApiService } from 'src/coordinate-api/coordinate-api.service';
import { HttpModule } from '@nestjs/axios';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { ImagesModule } from 'src/images/images.module';
import { ImagesService } from 'src/images/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pools]),
    HttpModule,
    AuthModule,
    ImagesModule
],
  controllers: [PoolsController],
  providers: [
    PoolsService,
    CoordinateApiService,
    ImagesService
  ],
  exports: [
    PoolsService
  ]
})
export class PoolsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware)
        .forRoutes(PoolsController)
  }
}
