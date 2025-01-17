import { Module } from '@nestjs/common';
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports : [
    UsersModule,
    JwtModule.register({
      global : true,
      secret : jwtConstants.secret,
      signOptions : {expiresIn : '15m'}
    })
  ],
  controllers : [AuthController],
  providers : [AuthService],
  exports : [AuthService],
})
export class AuthModule {}
