import {
  Body,
  Controller, Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req
} from "@nestjs/common";
import { Request } from "express";
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { ApiBody, ApiCookieAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { WriteSwimLogDto } from "./dto/writeSwimLog.dto";
import { SwimLogsService } from "./swim_logs.service";
import { SwimLogs } from "./swim_logs.entity";
import { AdminSearchSwimLogsDto } from "./dto/adminSearchSwimLogs.dto";

@ApiCookieAuth("access-cookie")
@Controller("api/v1/logs")
export class SwimLogsController {
  constructor(private readonly swimLogsService : SwimLogsService) {
  }

  // 내 수영기록 저장
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

  // 관리자는 유저의 수영 기록을 관찰 할 수 있다.
  @Get("user-logs")
  async getUserLogs(@Query() adminSearchSwimLogsDto : AdminSearchSwimLogsDto, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {year, month, day} = adminSearchSwimLogsDto;

    const {role} = jwtPayload;

    if(role !== "admin") {
      throw new HttpException({
        "status" : "error",
        "message" : "관리자가 아니면, 유저의 활동 기록을 볼 수 없습니다."
      }, HttpStatus.FORBIDDEN);
    }

    const userLogs = await this.swimLogsService.getUserLogs(adminSearchSwimLogsDto);

    let totalSwimLength = 0;

    let userSet = new Set<number>();

    const groupDate = userLogs.reduce((store, record) => {
      const userId = record.user_id;
      const swimLength = record.swim_length;
      const date = record.swim_date;

      // 만약 Set 에 유저가 없었다면, 새로운 유저 등록
      if(!userSet.has(userId)) {
        userSet.add(userId);
      }

      // 모든 유저의 수영 총량 추가
      totalSwimLength += swimLength;

      // 누산 객체에 해당 날짜의 key 가 없다면, 해당 날짜로 배열을 만들어 준다.
      if(!store[date]) {
        store[date] = [];
      }

      store[date].push({
        logId : record.id,
        userId : record.user_id,
        startTime : record.start_time,
        endTime : record.end_time,
        laneLength : record.lane_length,
        swimCategory : record.swim_category,
        swimLength : record.swim_length,
        note : record.note,
        created_at : record.created_at
      });

      return store;
    }, {} as Record<string, any[]>);


    return {
      status : "success",
      message : userLogs.length === 0 ? "해당 기간에 유저 로그가 없습니다." : "유저 수영 기록 조회에 성공했습니다.",
      data : {
        year : year,
        month : month,
        day : day,
        userNumber : userSet.size,
        userTotalLength : totalSwimLength,
        record : groupDate
      }
    }
  }

  // 나의 특정 수영기록 조회 - 수영 로그 id 로.
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

  // 사용자는 자신의 수영 기록 하나씩 삭제 할 수 있다 - Param(log_id) 필요
  @Delete(":log_id")
  async deleteMyLog(@Param("log_id", ParseIntPipe) log_id : number, @Req() req : Request) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    // 기록 삭제 진행
    const deletedLog = await this.swimLogsService.deleteMyLog(log_id, id);

    return {
      status : "success",
      message : "수영 기록을 삭제하는데 성공했습니다.",
      data : {
        ...deletedLog
      }
    }
  }

  // year(required), month(required), day(optional) - 사용자는 연도,월, 일 을 기준으로 자신의 수영 기록을 가져올 수 있다.
  // (달력으로 보여준다 가정)
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
    example : "12",
    required : true
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
      message : mySwimLogs.length === 0 ? "수영 기록이 없습니다." : "수영 기록을 가져오는 데 성공했습니다.",
      data : {
        year : swimLogQuery.year,
        month : swimLogQuery.month,
        day : swimLogQuery.day,
        totalSwimLength : totalSwimLength,
        records : groupByDate
      }
    }
  }

}
