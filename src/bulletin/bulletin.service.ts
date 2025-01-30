import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GetAllBulletinDto } from "./dto/getAllBulletin.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SwimLogs } from "../swim_logs/swim_logs.entity";
import { Repository } from "typeorm";

@Injectable()
export class BulletinService {
  constructor(
    @InjectRepository(SwimLogs) private swimLogsRepository : Repository<SwimLogs>
  ) {}

  async getAllBulletin(query : GetAllBulletinDto) {
    const {page, limit} = query;

    const [logs, count] = await this.swimLogsRepository.findAndCount({
      skip : (page - 1) * limit,
      take : limit,
      order : {
        swim_date : "DESC"
      },
      relations : {
        users : true
      }
    })

    // 단 하나의 유저 기록도 존재하지 않는다면 - 그럴 일은 거의 없을듯. (테이블을 DROP 하지 않는 이상.)
    if(logs.length === 0) {
      throw new HttpException({
        status : "fail",
        message : "어떠한 유저의 수영 기록도 존재하지 않습니다."
      }, HttpStatus.NOT_FOUND);
    }

    return {
      status : "success",
      message : "오수완 조회 성공",
      data : {
        totalCount : count,
        page : page,
        limit : limit,
        record : logs
      }
    }
  }
}
