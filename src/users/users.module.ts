import { forwardRef, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { AuthModule } from "../auth/auth.module";
import { AuthMiddleware } from "../common/middleware/auth.middleware";
import { AuthService } from "../auth/auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      // 쿠키 기반의 인증 적용
      .apply(AuthMiddleware)
      // Users 컨트롤러에 선언된 모든 컨트롤러에
      .forRoutes(UsersController)
  }
}
