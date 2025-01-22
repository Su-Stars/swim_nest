import { Injectable } from '@nestjs/common';
import { SwimLogQueryDto } from "./dto/swimLogQuery.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SwimLogs } from "./swim_logs.entity";
import { Between, Repository } from "typeorm";

@Injectable()
export class SwimLogsService {
  constructor(
    @InjectRepository(SwimLogs) private swimLogsRepository : Repository<SwimLogs>
  ) {
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

  }
}
