import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import * as process from "node:process";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 요청이 날아왔을 때, 해당 요청이 아래와 같은 origin 을 가지고 있다면 통과시킨다.
  // 현재는 프론트엔드 기본 port 로 설정 해 놓은 상황.
  app.enableCors({
    origin: [
      'https://localhost:3000',
      'http://localhost:3000',
      'http://nest-aws.site',
      'https://nest-aws.site',
      'https://apuu.netlify.app'
    ],
    // 앞으로 사용하게 될 메서드에 대한 허용.
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // 민감한 정보도 담을 수 있다. - ex - Access-Control-Allow-Credential
    credentials: true,
  });

  // 요청과 함께 기본적으로 내부 쿠키를 파싱해서 컨트롤러에 전달.
  app.use(cookieParser());

  /*
  전역으로 선언되었기에, 모든 컨트롤러 라우트 핸들러에 적용되는 내용입니다.
  "class-validator" 라이브러리와 관련된 파이프를 적용시키는데,
  whitelist : 요청 타입을 클래스로 선언하여 받게 되는데, 여기서 데코레이터 (@IsString() 과 같은 것들) 가 없는 속성은 제거한다는 의미입니다.
  forbidNonWhitelisted : class-validator 에 따라 들어오지 않는 속성을 제거하지 않고, 해당되는 예외를 던져줍니다.
  transform : 객체에 선언된 데코레이터만으로 추출하는 것이 아니라, 기본 타입 (string, int, 와 같은 것들) 을 자동으로 변환해 줍니다.

  즉, 우리가 만들게 될 xxx.dto.ts 파일 내부에 선언된 데코레이터에 알맞지 않는 데이터가 들어온다면 클라이언트에 에러를 던져줍니다.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

 // 만들어질 도메인에 "/api" 로 들어가면, 현재까지 만들어진 api 목록들을 쉽게 볼 수 있습니다. 협업을 위해 필수적인 도구입니다.
  const config = new DocumentBuilder()
    .setTitle('SwimStar API Docs')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addTag('api')
    // Bearer 토큰을 필요로 하는 라우트의 경우, "@ApiBearerAuth('access_token')" 데코레이터를 붙여서 스웨거 문서에 알릴 수 있습니다.(컨트롤러 and 메서드 가능)
    .addCookieAuth(
      "access-cookie",
      {
        type: 'http',
        scheme : 'Bearer',
        in: 'cookie',
      },
      'access_token',
    )
    .addCookieAuth(
      'refresh-cookie',
      {
        type : "http",
        scheme : "Bearer",
        in : "cookie",
      },
      "refresh_token"
    )
    .build();

  // 바로 위에서 만든 config (설정) 객체를 인자로 주면서 swagger 문서를 만듭니다.
  // 프로그램이 실행되기 위해 컴파일 되는 과정에서 swagger 전용 데코레이터 "ApiBody", "ApiQuery", "ApiHeader" 를 파악하여 스웨거 문서로 변환합니다.
  const document = SwaggerModule.createDocument(app, config);
  // 스웨거 문서는 "/api" 에서 볼 수 있습니다.
  SwaggerModule.setup('api', app, document, {
    swaggerOptions : {
      persistAuthorization : true,
    }
  });


  await app.listen(3000);
}
bootstrap();
