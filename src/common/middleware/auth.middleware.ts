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

    console.log(accessToken);
    console.log(refreshToken);

    try{
      if(accessToken && typeof accessToken === 'string') { // access 토큰이 만료되지 않았다면, 쿠키로서 전해져 온 것이다.

        req["user"] = await this.authService.validateAccessToken(accessToken);
      } else if(refreshToken && typeof refreshToken === 'string') { // access 토큰이 만료되었으므로, 리프레쉬 토큰을 인증하여 다시 accessToken 을 넣어준다.(쿠키에)

        // Refresh 토큰으로부터 내부의 페이로드를 가져와서 그대로 access 토큰으로 발급한다. (내용물은 동일하므로)
        const tokenPayload = await this.authService.validateRefreshToken(refreshToken);

        // 새로운 액세스 토큰 발급
        const newAccessToken = await this.authService.generateAccessToken(tokenPayload);

        console.log(newAccessToken)

        // 결과적으로 리프레쉬 토큰으로 액세스 토큰을 새로 발급한 것이다.
        res.cookie("access_token", newAccessToken.accessToken, {
          httpOnly : true,
          maxAge : 1 * 24 * 60 * 60 * 1000, // 하루
        });

        req["user"] = await this.authService.validateAccessToken(accessToken);

      } else { // 둘 다 없다면, 권한이 없는거나 마찬가지이므로, "로그인이 필요합니다" 가 페이지 알림으로 떠야 할 것이다.

        // next() 를 통해 핸들러에 도달하지 못하고, 곧바로 클라이언트에게 "로그인 요청" 을 보내는 것이다.
        throw new HttpException({
          message : "모든 토큰(access, refresh) 이 소진되어 로그인 해야합니다."
        }, HttpStatus.UNAUTHORIZED)
      }

      // 권한 인증이 완료되었으니, 그 다음 핸들러로 이동한다.
      next();
    } catch(error) {
      console.error("Middleware 에러:", error.message);
      throw new HttpException(
        { message: "인증 실패. 다시 로그인해주세요." },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}