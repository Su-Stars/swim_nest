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
import { FollowsModule } from './follows/follows.module';
import { Follows } from "./follows/follows.entity";
import { ReviewsModule } from './reviews/reviews.module';
import { Keyword, Review_Keywords, Reviews } from './reviews/reviews.entity';
import { BulletinModule } from './bulletin/bulletin.module';
import { UserImages } from "./users/user-images.entity";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal : true}),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as "mysql",
      host: process.env.NODE_ENV === "development" ? "localhost" : process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.NODE_ENV === "development" ? "root" : process.env.DB_USERNAME,
      password: process.env.NODE_ENV === "development" ? "root" : process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Pools, Users, Images, Bookmarks, SwimLogs, PoolImages, UserImages, Reviews, Keyword, Review_Keywords, Follows],
      synchronize: true,
      charset : "utf8mb4",
      // e2e 테스팅용
      dropSchema : true,
    }),
    AppModule,
    UsersModule,
    AuthModule,
    PoolsModule,
    ImagesModule,
    BookmarksModule,
    SwimLogsModule,
    FollowsModule,
    ReviewsModule,
    BulletinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports : [AppModule],
})
export class AppModule {}
