import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SwimLogs } from "./swim_logs.entity";
import { Between, Repository } from "typeorm";
import { WriteSwimLogDto } from "./dto/writeSwimLog.dto";
import { fullTimeToDate } from "../common/util/date-util";

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
}
