import { Body, Controller, Delete, Post, Res } from "@nestjs/common";
import { CreateUsersDto } from "./dto/create-users.dto";
import { AuthService } from "./auth.service";
import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { EmailVerificationDto } from "./dto/email-verification.dto";
import { Response } from "express";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LoginDto } from "./dto/login.dto";

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
  @Post("logout")
  async logout(@Res() response : Response) {
    await this.authService.clearAuthCookies(response);

    return response.json({
      message : "로그아웃 되었습니다."
    })
  }

  @Post("refresh-token")
  async getRefreshToken(@Res() response : Response) {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
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
    return await this.authService.register(createUsersDto);
  }

  // 비밀번호를 잊어버렸을 때 (이메일로 새 비밀번호 보내주기)
  @Post("forgot-password")
  @ApiBody({
    type : ForgotPasswordDto
  })
  async forgotPassword(@Body() forgotPasswordDto : ForgotPasswordDto) {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
    }
  }

  // 비밀번호 재설정
  @Post("reset-password")
  @ApiBody({
    type : ResetPasswordDto
  })
  async resetPassword(@Body() resetPasswordDto : ResetPasswordDto, @Res() response : Response ) {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
    }
  }

  // 이메일 확인 (이미 유저 계정 중 해당 이메일을 사용하고 있는지)
  @ApiBody({
    type : EmailVerificationDto
  })
  @Post("email-verification")
  async emailVerification(@Body() emailVerificationDto : EmailVerificationDto) {
    return {
      message : "아직 제작되지 않은 라우트입니다.",
    }
  }

}
