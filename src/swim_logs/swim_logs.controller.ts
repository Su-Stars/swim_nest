import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { ApiBody, ApiCookieAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { WriteSwimLogDto } from "./dto/writeSwimLog.dto";
import { SwimLogsService } from "./swim_logs.service";
import { SwimLogs } from "./swim_logs.entity";

@ApiCookieAuth("access-cookie")
@Controller("api/v1/logs")
export class SwimLogsController {
  constructor(private readonly swimLogsService : SwimLogsService) {
  }

  @ApiBody({
    type : WriteSwimLogDto,
  })
  @ApiCookieAuth("access-cookie")
  @Post()
  async writeSwimLogs( @Body() writeSwimLogDto : WriteSwimLogDto, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    await this.swimLogsService.writeSwimLog(id, writeSwimLogDto);

    return {
      status : "success",
      message : "수영기록이 저장되었습니다.",
    }
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
  @ApiCookieAuth("access-cookie")
  async getMySwimLogs(@Query() swimLogQuery : SwimLogQueryDto , @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    const mySwimLogs = await this.swimLogsService.getMySwimLogs(id, swimLogQuery);

    let totalSwimLength = 0;

    // 날짜 그룹화 - reduce 를 이용한 계산
    const groupByDate = mySwimLogs.reduce((store, record) => {
      // 중심이 될 날짜 추출
      const date = record.swim_date;

      // 만약, 계산되며 저장되는 store 객체에 해당 날짜 키가 없다면, 이를 빈 배열로 등록. (즉, 초기화)
      if(!store[date]) {
        store[date] = [];
      }

      store[date].push({
        logId : record.id,
        startTime : record.start_time,
        endTime : record.end_time,
        laneLength : record.lane_length,
        swimCategory : record.swim_category,
        swimLength : record.swim_length,
        note : record.note,
        created_at : record.created_at
      })

      totalSwimLength += record.swim_length

      return store;
    }, {} as Record<string, any[]>);

    return {
      status : "success",
      message : "수영 기록을 가져오는 데 성공했습니다.",
      data : {
        year : swimLogQuery.year,
        month : swimLogQuery.month,
        day : swimLogQuery.day,
        totalSwimLength : totalSwimLength,
        records : groupByDate
      }
    }
  }

  @Get(":log_id")
  async getMyLog(@Param("log_id", ParseIntPipe) log_id : number, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    const swim_log = await this.swimLogsService.getMyLog(id, log_id);

    return {
      status : "success",
      message : "나의 특정 수영활동 기록 조회 성공!",
      data : swim_log
    }
  }
}
