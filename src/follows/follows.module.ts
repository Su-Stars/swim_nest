import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Follows } from "./follows.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Follows]), AuthModule],
  providers: [FollowsService],
  controllers: [FollowsController],
  exports : [TypeOrmModule, FollowsService]
})
export class FollowsModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthModule)
      .forRoutes(FollowsController)
  }
}
