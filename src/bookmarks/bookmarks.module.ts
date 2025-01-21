import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bookmarks } from "./bookmarks.entity";
import { BookmarksService } from "./bookmarks.service";
import { BookmarksController } from './bookmarks.controller';
import { AuthMiddleware } from "../common/middleware/auth.middleware";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmarks]),
    AuthModule
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService, TypeOrmModule],
})
export class BookmarksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(BookmarksController)
  }
}
