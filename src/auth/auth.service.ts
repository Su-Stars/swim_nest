import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express"
import { CreateUsersDto } from "./dto/create-users.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "../users/users.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import * as process from "node:process";
import { LoginDto } from "./dto/login.dto";
import { JwtPayload } from "./dto/jwt-payload";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository : Repository<Users>,
    private jwtService : JwtService
  ) {}

  // 회원가입 - 나중에 multipart/form-data 형식으로 오면 이미지 s3 버킷에 날려줘야함 - 추후 수정해야한다.
  async register(createUsersDto : CreateUsersDto) : Promise<Users> {
    const {email, password, role, description} = createUsersDto;

    // 이미 해당 이메일을 가진 유저가 존재하는지 확인
    const isExistingEmail = await this.usersRepository.findOne({
      where : {
        email : email
      }
    })

    if(isExistingEmail) {
      throw new HttpException({
        status : "fail",
        message : "동일한 이메일을 가진 유저가 존재합니다."
      }, HttpStatus.NOT_ACCEPTABLE)
    }


    let {nickname} = createUsersDto;

    // 사용자가 닉네임을 넣지 않았다면,
    if(!nickname) {
      nickname = await this.generateCuteRandomName();
    }

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
      nickname : nickname,
      description : description,
      role : role,
      salt : salt,
    });

    // 저장 후 저장된 엔티티 반환
    const userInfo = await this.usersRepository.save(newUsers);

    // 비밀번호 빼고 반환
    return await this.exceptPwd(userInfo);
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
        message : "해당 계정이 존재하지 않습니다."
      }, HttpStatus.BAD_REQUEST)
    }

    // 데이터베이스에는 비밀번호가 해싱되어 있음.
    const dbPassword = loginUsers.password;
    const hashedPassword = await bcrypt.hash(password, loginUsers.salt);

    const loginSuccess = dbPassword === hashedPassword;

    // 비밀번호가 틀림.
    if(!loginSuccess) {
      throw new HttpException({
        message : "비밀번호가 틀렸습니다."
      }, HttpStatus.UNAUTHORIZED);
    }

    const result = {
      id : loginUsers.id,
      email : email,
      nickname : loginUsers.nickname,
      role : loginUsers.role
    }

    const {accessToken, refreshToken} = await this.generateAllTokens(result);

    await this.usersRepository.update({ id : loginUsers.id}, {refresh_token : refreshToken});

    // 응답 객체에 쿠키로 2 개 심기 - 액세스, 리프레쉬
    await this.setAuthCookies(response, {accessToken, refreshToken});

    return {
      message : "로그인 성공했습니다.",
      status : "success",
      data : result,
    }
  }


  // 어짜피 로그인하는 거 한 번에 두 개의 토큰을 생성 - "로그인" 할 때
  async generateAllTokens(payload: Record<string, any>): Promise<{
    accessToken : string,
    refreshToken : string,
  }> {
    const { exp, ...restPayload } = payload; // exp 속성을 제거 - 중복 만료 선언때문에 오류남.

    const accessToken = await this.jwtService.signAsync(restPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m', // 5 분마다 액세스 토큰 재발급
    });

    const refreshToken = await this.jwtService.signAsync(restPayload, {
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
    const { exp, ...restPayload } = payload; // exp 속성을 제거 - 중복 만료 선언때문에 오류남.

    const accessToken = await this.jwtService.signAsync(restPayload, {
      secret : process.env.JWT_SECRET,
      expiresIn : "5m",
    })

    return { accessToken : "Bearer " + accessToken };
  }

  // 생성된 두 개의 쿠키(access, refresh) 를 설정 - access 만 주거나, refresh 둘 다 주거나
  async setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken?: string | undefined },
  ) : Promise<void> {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000, // 5 분
    });


    if(tokens.refreshToken){
      response.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 하루
      });

    }
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
  async validateAccessToken(token: string) {
    if (!token || typeof token !== 'string') {
      return new HttpException("유효하지 않은 토큰 형식입니다.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    token = token.replace("Bearer ", "");

    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      return new HttpException({
        message : "access 토큰이 만료되었습니다.",
        error : error,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Refresh token 검증 - Middleware 에서 사용 예정
  async validateRefreshToken(token: string) {
    if (!token || typeof token !== 'string') {
      return new HttpException("유효하지 않은 토큰 형식입니다.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    token = token.replace("Bearer ", "");

    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      return new HttpException({
        message : "access_token 검증 중 실패",
        error : error,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async verificationEmail(email : string) : Promise<boolean> {
    const getUser = this.usersRepository.findOneBy({
      email : email
    })

    return getUser ? true : false;
  }

  async resetPassword(password : string, newPassword : string, userId : number) {
    const users = await this.usersRepository.findOneBy({id : userId});

    const isValidPwd = this.checkPwd(users, password);

    if(!isValidPwd) {
      throw new HttpException(
        {
          message : "주어진 비밀번호가 일치하지 않습니다."
        },
        HttpStatus.BAD_REQUEST
      )
    }

    const salt = users.salt;

    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    return await this.usersRepository.update({
      id : userId,
    }, {
      password : hashedPassword
    });
  }

  // 어떠한 유저 형태의 객체이던, 패스워드와 salt 빼고 다시 되돌려줌 (보안을 위함.)
  private async exceptPwd(user : any) {
    const {password, salt,  ...userInfo} = user;
    return userInfo;
  }

  private async checkPwd(users : Users, password : string) : Promise<boolean> {
    const salt = users.salt;

    const hashedPwd = bcrypt.hashSync(password, salt);

    return users.password === hashedPwd;
  }

  // 랜덤으로 이름을 지어 사용자의 이름을 정해준다.
  private async generateCuteRandomName() {
    const adjectives = [
      "귀여운",
      "달려가는",
      "웃는",
      "작은",
      "빠른",
      "재빠른",
      "용감한",
      "행복한",
      "뭉클한",
      "감격스런",
      "감사한",
      "즐거운",
      "기쁜",
      "따뜻한"
    ];

    const animals = [
      "다람쥐",
      "청솔모",
      "토끼",
      "사슴",
      "호랑이",
      "고양이",
      "강아지",
      "사자",
      "거북이",
      "코알라",
      "수달",
      "꽃사슴",
      "고라니",
      "담비",
    ];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

    const lastUsersId = await this.usersRepository
      .createQueryBuilder("users")
      .select("MAX(users.id)", "maxId")
      .getRawOne();

    return randomAdjective + " " + randomAnimal + lastUsersId.maxId;
  }
}



