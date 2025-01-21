import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bookmarks } from "./bookmarks.entity";
import { BookmarksService } from "./bookmarks.service";
import { BookmarksController } from './bookmarks.controller';

@Module({
  imports : [
    TypeOrmModule.forFeature([Bookmarks]),
  ],
  controllers: [BookmarksController],
  providers : [BookmarksService],
  exports : [BookmarksService, TypeOrmModule],
})
export class BookmarksModule {}
