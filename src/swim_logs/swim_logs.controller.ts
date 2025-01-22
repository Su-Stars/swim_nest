import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { ApiQuery } from "@nestjs/swagger";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { WriteSwimLogDto } from "./dto/writeSwimLog.dto";
import { SwimLogsService } from "./swim_logs.service";
import { SwimLogs } from "./swim_logs.entity";

@Controller("api/v1/logs")
export class SwimLogsController {
  constructor(private readonly swimLogsService : SwimLogsService) {
  }

  @Post()
  async writeSwimLogs( @Body() writeSwimLogDto : WriteSwimLogDto, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];


  }

  @Get()
  @ApiQuery({
    name : "year",
    description : "연도 4자리",
    example : "2010",
    required : true
  })
  @ApiQuery({
    name : "month",
    description : "1 ~ 12 월 중 하나",
    example : "12"
  })
  @ApiQuery({
    name : "day",
    description : "몇 일",
    example : "25",
    required : false
  })
  async getMySwimLogs(@Query() swimLogQuery : SwimLogQueryDto , @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    const mySwimLogs : SwimLogs[] = await this.swimLogsService.getMySwimLogs(id, swimLogQuery);

    return {
      status : "success",
      message : "수영 기록을 가져오는 데 성공했습니다.",
      data : mySwimLogs
    }
  }
}
