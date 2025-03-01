import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../app.module";
import * as request from "supertest";

describe("Users E2E 테스팅!", () => {
  // app.module.ts 와 같은 모듈을 가지게 됨.
  let app : INestApplication;

  // app.module.ts 를 참조하여, 세팅을 그대로 "app" 을 구성한다.
  beforeAll(async () => {
    const moduleFixture : TestingModule = await Test.createTestingModule({
      imports : [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST api/v1/auth/register (사용자 생성하기)", async () => {
    const response = await request(app.getHttpServer())
      .post("api/v1/auth/register")
      .send({
        email : "test@gmail.com",
        password : "12345678"
      })
      .expect(201);
  })
})