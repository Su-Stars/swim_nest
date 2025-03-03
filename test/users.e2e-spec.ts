import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import * as request from "supertest";
import * as assert from "node:assert";
import * as cookieParser from "cookie-parser";

describe("Users E2E 테스팅!", () => {
  // app.module.ts 와 같은 모듈을 가지게 됨.
  let app : INestApplication;
  let agent : request.Agent;

  // app.module.ts 를 참조하여, 세팅을 그대로 "app" 을 구성한다.
  beforeAll(async () => {
    const moduleFixture : TestingModule = await Test.createTestingModule({
      imports : [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    await app.init();

    // 쿠키 기반 인증을 테스팅하기 위해, 에이전트를 생성
    agent = request.agent(app.getHttpServer());
  });

  // users 에서의 모든 e2e 테스팅이 끝나면, 위에서 만든 Test 어플리케이션을 종료한다.
  afterAll(async () => {
    await app.close();
  });

  it("POST api/v1/auth/register (사용자 생성하기)", async () => {
    const response = await agent
      .post("/api/v1/auth/register")
      .send({
        email : "test@gmail.com",
        password : "12345678"
      })
      .expect(201);

  });

  it("POST api/v1/auth/login (사용자 로그인 후 토큰 검증)", async () => {
    const response = await agent
      .post("/api/v1/auth/login")
      .send({
        email : "test@gmail.com",
        password : "12345678"
      })
      .expect(201);

    console.log("Set-Cookie Headers:", response.headers['set-cookie']);
  });

  it("GET api/v1/users/me (사용자 로그인 후 자신의 정보 검색)", async () => {
    const response = await agent
      .get("/api/v1/users/me")
      .expect(200);

    console.log(response);
  })
})