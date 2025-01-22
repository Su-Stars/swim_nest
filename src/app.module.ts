import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PoolsModule } from './pools/pools.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pools } from './pools/pools.entity';
import { Users } from "./users/users.entity";
import { Bookmarks } from "./bookmarks/bookmarks.entity";
import { BookmarksService } from './bookmarks/bookmarks.service';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import * as process from "node:process";
import { ImagesModule } from './images/images.module';
import { Images } from './images/images.entity';

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
      entities: [Pools, Users, Images, Bookmarks],
      synchronize: true,
      charset : "utf8mb4",
    }),
    AppModule,
    UsersModule,
    AuthModule,
    PoolsModule,
    ImagesModule,
    BookmarksModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
