import { Body, Controller, Delete, Get, Patch, Req, Res } from "@nestjs/common";
import { UsersService } from "./users.service";
import { Request, Response } from "express";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { EditUserInfoDto } from "./dto/editUserInfo.dto";
import { ApiBody, ApiCookieAuth } from "@nestjs/swagger";
import { AuthService } from "../auth/auth.service";

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService : UsersService, private readonly authService : AuthService) {}

  // 본인의 계정 삭제 - express res 객체를 사용하면, 반환할 때 무조건 res.json or end 로 끝내야함.(Nest 국룰임)
  @Delete("me")
  @ApiCookieAuth()
  async deleteAccount(@Req() req : Request, @Res() res : Response) {
    const jwtPayload : JwtPayload = req["user"];

    // 쿠키에 있던 유저의 id 추출
    const {id} = jwtPayload;

    // 삭제 과정
    await this.usersService.deleteMyAccount(id);

    await this.authService.clearAuthCookies(res);

    return res.json({
      status : "success",
      message : "계정이 삭제되었습니다.",
    });
  }

  // 본인의 정보 수정
  @Patch("me")
  @ApiCookieAuth()
  @ApiBody({
    type : EditUserInfoDto
  })
  async patchAccount(@Req() req : Request, @Body() editInfo : EditUserInfoDto) {
    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload;

    await this.usersService.editMyInfo(id, editInfo);

    return {
      status : "success",
      message : "정보 수정을 완료했습니다.",
    }
  }

  @Get("me")
  @ApiCookieAuth()
  async getMyAccount(@Req() req : Request) {
    const payload : JwtPayload = req["user"];

    console.log(payload);

    const result = await this.usersService.getMyInfo(payload);

    return {
      status : "success",
      message : "자기 자신 정보 가져오기 성공",
      data : result
    }
  }
}
