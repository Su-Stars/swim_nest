import { Module } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { BulletinController } from './bulletin.controller';

@Module({
  providers: [BulletinService],
  controllers: [BulletinController]
})
export class BulletinModule {}
