import { Body, Controller, Delete, HttpCode, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { CreateUsersDto } from "./dto/create-users.dto";
import { AuthService } from "./auth.service";
import { ApiBody, ApiCookieAuth, ApiNotAcceptableResponse, ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { EmailVerificationDto } from "./dto/email-verification.dto";
import { Request, Response } from "express";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./dto/jwt-payload";

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인 - Express 로 Response 객체를 꺼냈으므로, 반드시 response.json() or end() 로 끝내야만 한다.
  @Post("login")
  @ApiBody({
    type : LoginDto
  })
  async login(@Body() loginDto : LoginDto, @Res() response : Response) {
    const result = await this.authService.login(loginDto, response);
    return response.json(result);
  }

  // 로그아웃 - 이것도 response.json() or end() 로 끝내야 한다.
  @HttpCode(200)
  @Post("logout")
  async logout(@Res() response : Response) {
    await this.authService.clearAuthCookies(response);

    return response.json({
      status : "success",
      message : "로그아웃 되었습니다."
    })
  }

  // Access, Refresh 두 개 모두 쿠키(httpOnly) 로 인해 사용되지 않게 될 예정.
  @Post("refresh-token")
  async getRefreshToken(@Res() response : Response) {
    return {
      message : "Access, Refresh 두 개 모두 쿠키(httpOnly) 로 인해 사용되지 않습니다.",
    }
  }

  // 회원가입
  @ApiBody(
    {
      type : CreateUsersDto
    }
  )
  @Post("register")
  async register(@Body() createUsersDto : CreateUsersDto) {
    const {id, email, nickname} = await this.authService.register(createUsersDto);

    return {
      status : "success",
      message : "회원가입 성공",
      data : {
        user_id : id,
        email : email,
        nickname : nickname
      }
    }
  }

  // 비밀번호를 잊어버렸을 때 (이메일로 새 비밀번호 보내주기)
  @Post("forgot-password")
  @ApiBody({
    type : ForgotPasswordDto
  })
  async forgotPassword(@Body() forgotPasswordDto : ForgotPasswordDto) {
    return {
      message : "NodeMailer 를 통해 만들어야 되는 핸들러입니다. (아직 미제작)",
    }
  }

  // 비밀번호 재설정
  @HttpCode(200)
  @Post("reset-password")
  @ApiBody({
    type : ResetPasswordDto
  })
  async resetPassword(@Body() resetPasswordDto : ResetPasswordDto, @Req() req : Request ) {
    const {password, newPassword} = resetPasswordDto;

    const jwtPayload : JwtPayload = req["user"];

    const {id} = jwtPayload

    await this.authService.resetPassword(password, newPassword, id);

    return {
      status : "success",
      message : "비밀번호 변경이 완료 되었습니다.",
    }
  }

  // 이메일 확인 (이미 유저 계정 중 해당 이메일을 사용하고 있는지)
  @ApiBody({
    type : EmailVerificationDto
  })
  @ApiNotAcceptableResponse({
    description : "해당 계정의 이메일이 존재 할 때 내보내는 오류이다.",
    example : {
      message : "이미 해당 계정의 이메일이 존재합니다."
    }
  })
  @Post("email-verification")
  async emailVerification(@Body() emailVerificationDto : EmailVerificationDto) {
    const {email} = emailVerificationDto;

    const verification : boolean = await this.authService.verificationEmail(email);

    // 해당 계정의 이메일이 이미 존재한다면
    if(!verification) {
      throw new HttpException({
        message : "이미 해당 계정의 이메일이 존재합니다."
      }, HttpStatus.NOT_ACCEPTABLE)
    }

    return {
      message : "사용 가능한 계정입니다."
    }
  }

  // access, refresh 테스팅용 핸들러
  @Post("testing-tokens")
  async testingTokens(@Req() req : Request){
    return req["user"];
  }
}
