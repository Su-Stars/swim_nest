import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { SwimLogsService } from './swim_logs.service';
import { SwimLogsController } from './swim_logs.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { SwimLogs } from "./swim_logs.entity";
import { AuthModule } from "../auth/auth.module";
import { AuthMiddleware } from "../common/middleware/auth.middleware";

@Module({
  imports: [TypeOrmModule.forFeature([SwimLogs]), AuthModule],
  providers: [SwimLogsService],
  controllers: [SwimLogsController],
  exports: [SwimLogsService],
})
export class SwimLogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(SwimLogsController)
  }
}
