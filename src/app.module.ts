import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PoolsModule } from './pools/pools.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolImages, Pools } from './pools/pools.entity';
import { Users } from "./users/users.entity";
import { Bookmarks } from "./bookmarks/bookmarks.entity";
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { SwimLogsModule } from './swim_logs/swim_logs.module';
import * as process from "node:process";
import { Images } from './images/images.entity';
import { SwimLogs } from "./swim_logs/swim_logs.entity";
import { ImagesModule } from './images/images.module';
import { ReviewsModule } from './reviews/reviews.module';
import { Keyword, Review_Keywords, Reviews } from './reviews/reviews.entity';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal : true}),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Pools, Users, Images, Bookmarks, SwimLogs, PoolImages, Reviews, Keyword, Review_Keywords],
      synchronize: true,
      charset : "utf8mb4",
      cache : {
        duration : 0
      }
    }),
    AppModule,
    UsersModule,
    AuthModule,
    PoolsModule,
    ImagesModule,
    BookmarksModule,
    SwimLogsModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
