import { Controller, Get, Query } from "@nestjs/common";
import { GetAllBulletinDto } from "./dto/getAllBulletin.dto";
import { BulletinService } from "./bulletin.service";

@Controller('api/v1/bulletin')
export class BulletinController {
  constructor(private readonly bulletinService : BulletinService) {}


  @Get()
  async getAllBulletin(@Query() query : GetAllBulletinDto) {
    return await this.bulletinService
  }
}
