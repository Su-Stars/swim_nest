import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { Response } from "express"
import { ResponsePayloadDto } from "./dto/response-payload.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService : JwtService
  ) {}

  // 어짜피 로그인하는 거 한 번에 두 개의 토큰을 생성 - "로그인" 할 때
  async generateTokens(payload: Record<string, any>) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m', // Access token expires in 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // Refresh token expires in 7 days
    });

    return { accessToken, refreshToken };
  }

  // 생성된 두 개의 쿠키(access, refresh) 를 설정
  async setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // 로그아웃이므로 access, refresh 둘 다 삭제
  async clearAuthCookies(response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'strict',
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  // access-token 검증 - Middleware 에서 사용 예정
  async validateAccessToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      return null;
    }
  }

  // Refresh token 검증 - Middleware 에서 사용 예정
  async validateRefreshToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      return null;
    }
  }
}
