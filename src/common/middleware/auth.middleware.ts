import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../auth/auth.service";

/*
개인적인 생각으로, 기존에 Header -> Authorization 으로 주어야 했던 토큰의 만료 기한은 의미가 없어졌다.
결국 "쿠키" 의 기능중 하나인 maxAge 로 만료 기한을 정해놨기 때문에, 정해진 기한이 지나면 사라진다. (req.cookies 에서 찾을 수 없다는 얘기)

그렇다면 JWT token 생성 시에 expire 옵션을 굳이 넣을 필요가 있을까 생각이 드는 코드이다.
 */

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService : AuthService) {}

  async use(req : Request, res : Response, next : NextFunction) {

    const accessToken = req.cookies["access_token"]
    const refreshToken = req.cookies["refresh_token"]

    const accessOrErr = await this.authService.validateAccessToken(accessToken);

    const refreshOrErr = await this.authService.validateRefreshToken(refreshToken);

    // 만약 두 토큰 모두 만료되거나 쿠키로 인해 없다면.
    if(accessOrErr instanceof HttpException && refreshOrErr instanceof HttpException) {
      throw new HttpException(
        {
          message : "모든 토큰이 만료되었습니다."
        },HttpStatus.UNAUTHORIZED
      )

      // Access Token 만 만료되었다면.
    } else if(accessOrErr instanceof HttpException) {
      // Refresh 토큰으로부터 내부의 페이로드를 가져와서 그대로 access 토큰으로 발급한다. (내용물은 동일하므로)
      const tokenPayload = await this.authService.validateRefreshToken(refreshToken);

      const {id, email, nickname, role} = tokenPayload;

      // 새로운 액세스 토큰 발급
      const newAccessToken = await this.authService.generateAccessToken({
        id : id,
        email : email,
        nickname : nickname,
        role : role
      });

      // 결과적으로 리프레쉬 토큰으로 액세스 토큰을 새로 발급한 것이다.
      res.cookie("access_token", newAccessToken.accessToken, {
        httpOnly : true,
        sameSite : "none",
        secure : true,
        maxAge : 5 * 60 * 1000, // 5 분
      });

      // 새로 생성된 access 토큰으로 컨트롤러에 넘겨줄 "user" 속성 정의
      req["user"] = await this.authService.validateAccessToken(accessToken);

      // access, refresh 두 토큰 모두 살아 있는 상황.
    } else {
      req["user"] = await this.authService.validateAccessToken(accessToken);
    }

    next();
  }
}