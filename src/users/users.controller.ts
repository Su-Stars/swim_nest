import { Controller, Delete, Patch } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService : UsersService) {}

  // 본인의 계정 삭제
  @Delete("me")
  async deleteAccount() {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
    }
  }

  // 본인의 정보 수정
  @Patch()
  async patchAccount() {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
    }
  }
}
