import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SwimLogs } from "./swim_logs.entity";
import { Between, Repository } from "typeorm";
import { WriteSwimLogDto } from "./dto/writeSwimLog.dto";
import { fullTimeToDate } from "../common/util/date-util";
import { AdminSearchSwimLogsDto } from "./dto/adminSearchSwimLogs.dto";

@Injectable()
export class SwimLogsService {
  constructor(
    @InjectRepository(SwimLogs) private swimLogsRepository : Repository<SwimLogs>
  ) {
  }

  async writeSwimLog(user_id : number, writeSwimLogDto : WriteSwimLogDto) {

    const newSwimLog = this.swimLogsRepository.create({
      user_id : user_id,
      ...writeSwimLogDto
    });

    const result = await this.swimLogsRepository.save(newSwimLog);

    if(!result) {
      throw new HttpException({
        status : "error",
        message : "수영기록이 저장되지 못했습니다 - 데이터베이스 오류"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMySwimLogs(user_id : number, swimLogQuery : SwimLogQueryDto) {
    const {year, month, day} = swimLogQuery;

    let start, end;
    if(day) {
      start = String(year) + "-" + String(month) + "-" + String(day) + " 00:00:00"
      end = String(year) + "-" + String(month) + "-" + String(day) + " 23:59:59"
    } else {
      const lastDay = new Date(year, month, 0).getDate();
      start = String(year) + "-" + String(month) + "-" + "01 00:00:00";
      end = String(year) + "-" + String(month) + "-" + String(lastDay) + " 23:59:59";
    }

    const swimLogList = await this.swimLogsRepository.find({
      where : {
        user_id : user_id,
        swim_date : Between(start, end)
      },
    })

    const resultLogList = swimLogList.map((swimLog) => ({
      ...swimLog,
      swim_date : fullTimeToDate(swimLog.swim_date)
    }))

    return resultLogList;
  }

  async getMyLog(user_id : number, log_id : number) {

    const swimLog = await this.swimLogsRepository.findOneBy({
      id : log_id,
      user_id : user_id
    });

    // 수영 기록이 없다면,
    if(!swimLog) {
      throw new HttpException({
        status : "error",
        message : "해당 수영 기록이 존재하지 않습니다."
      }, HttpStatus.NOT_FOUND);
    }

    // 유저 아이디는 딱히 필요 없음
    delete swimLog.user_id

    const returnLog = {
      ...swimLog,
      swim_date : fullTimeToDate(swimLog.swim_date)
    }

    return returnLog;
  }

  async getUserLogs(dateQuery : AdminSearchSwimLogsDto) {

    const {year, month, day} = dateQuery;

    // 달이 없고, 날만 있다면, 잘못된 요청이 온 것.
    if(!month && day) {
        throw new HttpException({
          status : "error",
          message : "정확한 일자를 확인하기 위해서는 몇 월인지 알아야 합니다 - month 빠짐"
        }, HttpStatus.BAD_REQUEST);
    }

    // 필터링 시작
    // 연도만 있을 경우
    let startDateStr;
    let endDateStr;
    if(!month && !day) {
      const lastDay = new Date(year, 12, 0).getDate();
      startDateStr = String(year) + "-01-01 00:00:00";
      endDateStr = String(year) + "-12-" + String(lastDay) + " 23:59:59";
    } else if(month && !day) { // 월 에 따른 결과물을 보고 싶을 경우,
      const lastDay = new Date(year, month, 0).getDate();
      startDateStr = String(year) + "-" + String(month) + "-01 00:00:00";
      endDateStr = String(year) + "-" + String(month) + "-" + String(lastDay) + " 23:59:59";
    } else { // 해당 날의 결과물을 보고 싶을 경우,
      startDateStr = String(year) + "-" + String(month) + "-" + String(day) + " 00:00:00";
      endDateStr = String(year) + "-" + String(month) + "-" + String(day) + " 23:59:59";
    }

    const userLogs = await this.swimLogsRepository.find({
      where : {
        swim_date : Between(startDateStr, endDateStr)
      },
      order : {
        swim_date : "ASC"
      }
    });

    const resultUserLogs = userLogs.map((log) => ({
      ...log,
      swim_date : fullTimeToDate(log.swim_date)
    }))

    return resultUserLogs;
  }

  async deleteMyLog(log_id : number, user_id : number) {
    // 현재 삭제하려는 수영 로그가 있는지 확인하기
    const isExistLog = await this.swimLogsRepository.findOne({
      where : {
        id : log_id,
        user_id : user_id
      }
    });

    // 만약 삭제하려는 로그가 존재하지 않는다면, 예외를 반환한다.
    if(!isExistLog) {
      throw new HttpException({
        status : "error",
        message : "해당 수영 로그는 이미 존재하지 않습니다.",
      }, HttpStatus.NOT_FOUND)
    }

    // 삭제 결과
    const result = await this.swimLogsRepository.delete({
      id : log_id,
      user_id: user_id,
    });

    // 이미 위에서 확인했지만, 데이터베이스에도 오류가 있을지 몰라 작성해놓음.
    if(result.affected === 0) {
      throw new HttpException({
        status : "error",
        message : "삭제하려는 로그가 데이터베이스에 존재하지 않습니다."
      }, HttpStatus.NOT_FOUND);
    }

    return isExistLog;
  }
}
