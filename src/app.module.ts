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
      entities: [Pools, Users, Images],
      synchronize: true,
      charset : "utf8mb4",
      timezone : "z"
    }),
    AppModule,
    UsersModule,
    AuthModule,
    PoolsModule
  ,
    ImagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
