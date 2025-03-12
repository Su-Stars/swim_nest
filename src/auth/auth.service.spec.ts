import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersModule } from "../users/users.module";
import { UsersService } from "../users/users.service";
import { AppModule } from "../app.module";

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports : [AppModule],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('service 메서드 검증', () => {
    expect(service.generateAccessToken({id : 1, email : "sample@gmail.com"})).toBe(String);
  })
});
