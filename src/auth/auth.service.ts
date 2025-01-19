import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express"
import { CreateUsersDto } from "./dto/create-users.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "../users/users.entity";
import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import * as process from "node:process";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./dto/jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository : Repository<Users>,
    private jwtService : JwtService
  ) {}

  async register(createUsersDto : CreateUsersDto) : Promise<Users> {
    const {email, password, nickname, description} = createUsersDto;


    // 여기에 필요하다면 image 서비스.

    // 환경변수에서 salt 몇 번 돌려서 암호화 할 건지 가져옴.
    const saltRound = parseInt(process.env.SALT_ROUND);

    // 이를 이용하여, 암호화에 사용할 "salt" 생성 - 유저 DB 에 저장
    const salt = await bcrypt.genSalt(saltRound);

    // 암호화 된 패스워드 생성
    const hashPassword = bcrypt.hashSync(password, salt);

    // 저장할 새로운 엔티티 생성
    const newUsers = this.usersRepository.create({
      email : email,
      password : hashPassword,
      nickname : nickname || "새로운 사용자",
      description : description,
      salt : salt,
    });

    // DB 저장과 동시에 해당 엔티티 반환
    return await this.usersRepository.save(newUsers);
  }

  async login(loginDto : LoginDto, response : Response) {
    const {email, password} = loginDto;

    // email 로 레코드 찾기
    const loginUsers = await this.usersRepository.findOneBy({
      email : email,
    });

    // 만약 이메일이 존재하지 않을 경우 바로 에러 던지기.
    if(!loginUsers) {
      throw new HttpException({
        message : "해당 이메일을 가진 계정이 존재하지 않습니다."
      }, HttpStatus.BAD_REQUEST)
    }

    // 데이터베이스에는 비밀번호가 해싱되어 있음.
    const dbPassword = loginUsers.password;

    const loginSuccess = await bcrypt.compare(password, dbPassword);

    // 비밀번호가 틀림.
    if(!loginSuccess) {
      throw new HttpException({
        message : "비밀번호가 틀렸습니다."
      }, HttpStatus.UNAUTHORIZED);
    }

    const {accessToken, refreshToken} = await this.generateAllTokens({
      id : loginUsers.id,
      email : email,
      nickname : loginUsers.nickname,
      role : loginUsers.role
    })

    await this.setAuthCookies(response, {accessToken, refreshToken});

    return {
      message : "로그인 성공했습니다.",
      status : "success",
    }
  }


  // 어짜피 로그인하는 거 한 번에 두 개의 토큰을 생성 - "로그인" 할 때
  async generateAllTokens(payload: Record<string, any>): Promise<{
    accessToken : string,
    refreshToken : string,
  }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m', // 5 분마다 액세스 토큰 재발급
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1d', // 하루에 한 번씩 리프레쉬 토큰 발급
    });

    return {
      accessToken : "Bearer " + accessToken,
      refreshToken : "Bearer " + refreshToken,
    };
  }


  async generateAccessToken(payload : Record<string, any>) : Promise<{
    accessToken : string;
  }> {

    const accessToken = this.jwtService.sign(payload, {
      secret : process.env.JWT_SECRET,
      expiresIn : "5m",
    })

    return { accessToken : "Bearer " + accessToken };
  }

  // 생성된 두 개의 쿠키(access, refresh) 를 설정 - access 만 주거나, refresh 둘 다 주거나
  async setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string | undefined },
  ) : Promise<void> {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 5 * 60 * 1000, // 5 분
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 하루
    });
  }

  // 로그아웃이므로 access, refresh 둘 다 삭제
  async clearAuthCookies(response: Response) : Promise<void> {
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
  async validateAccessToken(token: string) : Promise<JwtPayload> {
    token = token.replace("Bearer ", "");

    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new HttpException({
        message : "access_token 검증 중 실패",
        error : error,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Refresh token 검증 - Middleware 에서 사용 예정
  async validateRefreshToken(token: string) : Promise<JwtPayload> {
    token = token.replace("Bearer ", "");

    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new HttpException({
        message : "access_token 검증 중 실패",
        error : error,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
