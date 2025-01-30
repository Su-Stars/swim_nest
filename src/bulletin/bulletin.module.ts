import { Module } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { BulletinController } from './bulletin.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { SwimLogs } from "../swim_logs/swim_logs.entity";

@Module({
  imports : [TypeOrmModule.forFeature([SwimLogs])],
  providers: [BulletinService],
  controllers: [BulletinController],
  exports : [BulletinService]
})
export class BulletinModule {}
