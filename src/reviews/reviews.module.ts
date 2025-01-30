import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword, Review_Keywords, Reviews } from './reviews.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Pools } from 'src/pools/pools.entity';
import { ReviewsController } from './reviews.controller';
import { AuthMiddleware } from "../common/middleware/auth.middleware";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews, Keyword, Review_Keywords, Pools]),
    AuthModule,
  ],
  providers: [ReviewsService],
  exports: [ReviewsModule, TypeOrmModule],
  controllers: [ReviewsController],
})
export class ReviewsModule implements NestModule {
  async configure(consumer: MiddlewareConsumer){
    consumer
      .apply(AuthMiddleware)
      .forRoutes(ReviewsController)
  }
}
