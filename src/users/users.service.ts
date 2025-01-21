import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { EditUserInfoDto } from "./dto/editUserInfo.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository : Repository<Users>,
  ) {}

  async getMyInfo(jwtPayload : JwtPayload) {
    const {id} = jwtPayload;

    // 이거 수영장 정보랑 연동되면 수정해야함 - 릴레이션으로
    const users = await this.usersRepository.findOneBy({
      id : id,
    });

    const {password, salt, refresh_token, expiration_date,  ...result} = users;

    return result;
  }

  async editMyInfo(id : number, editInfo : EditUserInfoDto) {

    // 만약 요청 객체에 어떠한 사항도 담겨있지 않다면, (editObj) 에 어떠한 정보도 없음을 가정
    if(!editInfo) {
      throw new HttpException(
        {
          "message" : "변경된 사항이 없습니다."
        },
        HttpStatus.NO_CONTENT
      )
    }

    const editObj = {};

    if(editInfo.nickname)
      editObj["nickname"] = editInfo.nickname;

    if(editInfo.description)
      editObj["description"] = editInfo.description;

    if(editInfo.role)
      editObj["role"] = editInfo.role;



    const updateResult = await this.usersRepository.update({
      id : id
    }, editObj);


    return updateResult;
  }

  async deleteMyAccount(id : number) {

    const result = await this.usersRepository.delete({id : id});

    // 만약 삭제되지 않았다면 - 이는 해당 id 를 가진 유저가 데이터베이스에 없음을 의미한다.
    if(result.affected === 0){
      throw new HttpException({
        status : "fail",
        message : "해당 유저는 이미 존재하지 않습니다."
      }, HttpStatus.NOT_FOUND)
    }

    return result;
  }
}
