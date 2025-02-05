# 🐬 🏊🏻‍♂️ "내 주변 수영장을 한눈에, 수영 기록은 손쉽게" 어푸

![최종프로젝트 썸네일](https://github.com/user-attachments/assets/99bf4041-619c-462f-bba4-3b045d5bcb5c)

## 프로젝트 소개
- [x] **인증 (Auth)**: 회원가입, 로그인, 로그아웃 및 쿠키 기반의 토큰 인증 구현
- [x] **수영장 (Pools)**: 수영장 정보 조회 및 관리자 역할 확인시 정보 등록 및 삭제 가능
- [x] **이미지 (Images)**: 이미지 등록 및 삭제 기능
- [x] **수영 기록 (Swim_Logs)**: 개인 별 수영 기록 (접영, 배영, 등등)
- [x] **오수완 (Bulletin)**: 다른 사람들과 수영기록 공유 기능
- [x] **유저 (Users)**: 본인 정보 조회, 수정, 삭제 및 프로필 이미지 등록
- [x] **리뷰 (Reviews)**: 수영장에 대한 리뷰 기능
- [x] **북마크 (Bookmarks)**: 수영장에 대해 북마크(즐겨찾기) 기능 구현

## 팀원 구성
<div align="center">

| [박정환](https://github.com/JNL-2002) | [공담형](https://github.com/damhyeong) |
| -- | -- |
| <img src="https://avatars.githubusercontent.com/u/174254000?v=4" width="120"/>  | <img src="https://avatars.githubusercontent.com/u/114223031?v=4" width="120" />  |
| <p align="center">BE</p> | <p align="center">BE</p> |

</div>

## 1. 기술 스택

코어

- NestJS
- Typescript
- TypeORM2

데이터베이스

- MariaDB

인프라

- AWS EC2 - 백엔드 서버
- RDS - 데이터베이스 서버
- Route 53 - `nest-aws.site` 도메인 등록
- 가비아 - `nest-aws.site` 도메인 소유권 구입


버젼관리 및 배포
- Github - 코드 버전 관리
- Github Actions - EC2 접속 및 최신화
- PM2 - 로깅 관리 

협업
- [Notion](https://www.notion.so/2-a09c02ff095545d4bf00884941e82dd0)
- [Figma](https://www.figma.com/design/1HrYWDA8qCQhe16X9KLbeQ/%EC%96%B4%ED%91%B8-with-NextUI?node-id=5402-214&t=q1VwnV6tjMuvYoQY-1)
- Slack

## 2. API 목록

**Users 도메인**

`/api/v1/users` :

* `GET me`
* `DELETE me`
* `PATCH me`
* `GET me/reviews`
* `POST image`
* `DELETE image`
* `PATCH image`

**Auth 도메인**

`/api/v1/auth` :

* `POST login`
* `POST logout`
* `POST refresh-token`
* `POST register`
* `POST reset-password`
* `POST email-verification`

**Pools 도메인**

`api/v1/pools` :

* `GET /`
* `POST /`
* `GET :poolId`
* `PATCH :poolId`
* `DELETE :poolId`
* `POST images/:poolId`
* `PUT images/:pool_id`
* `GET :poolId/reviews`
* `POST :poolId/reviews`
* `PATCH :poolId/reviews/:reviewId`
* `DELETE :poolId/reviews/:reviewId`
* `POST :pool_id/bookmark`
* `DELETE :pool_id/bookmark`
* `GET :pool_id/bookmark`

**Reviews 도메인**

`api/v1/reviews` :

* `GET /`

**Bookmarks 도메인**

`api/v1/bookmarks` :

* `POST /`
* `GET /`
* `DELETE :bookmark_id`

**SwimLogs 도메인**

`api/v1/logs` :

* `POST /`
* `GET /`
* `GET user-logs`
* `GET :log_id`
* `DELETE :log_id`

**Bulletin 도메인**

`api/v1/bulletin` :

`GET /`


## 3. 역할 분담

### 공담형

* AWS 인프라 관리
* 보안, 유저, 로그, 북마크, 불레틴, 리뷰 API
* 전체 코드 리팩토링
* 초기 데이터베이스 확보 - 크롤링

### 박정환

* AWS S3 와 이미지 API 연동
* 카카오 API 를 사용한 수영장의 정확한 위치 API 연동
* 수영장 API


## 4. 브레이크 스루

### 수영장의 "위치정보" 및 "이미지정보" 확보

#### 문제 상황

- 공공데이터를 통해 전국의 수영장 이름 및 주소를 확보
- 그러나, 위치 정보의 프로토콜이 다르며(EPSG5174), 이미지 정보가 없음을 인지
- 구글은 이미지를 제공하나, 테스팅 과정만으로 2일만에 무료 수준인 22 만원의 토큰 소비
- 카카오, 네이버는 주소에 대한 정확한 위치 (lng, lat) 을 제공하나, 이미지를 제공하지 않음.

### 해결 과정

**좌표 추출**

1. KaKao API 중 좌표 반환 API 를 통해 모든 수영장에 대한 위치 정보 추출
2. 저장된 수영장 레코드를 데이터베이스에 삽입

**이미지 추출**

1. "네이버 지도" 의 검색 기능을 사용하기 위해서는, 실제로 브라우저와 서버 간의 세션 및 쿠키 연결 필요
2. 따라서, "네이버 지도" 페이지를 들어가는 크롤러 작성 (puppeteer 사용)
3. (네이버 지도 홈페이지 입장) --> (지도 검색 요청 전송) --> (응답 추출 후 브라우저 종료)
4. 추출된 이미지 정보 수영장 데이터베이스에 삽입

#### 결과

- 프론트에서 수영장 데이터 요청 시, 정확한 좌표와 이미지 리스트 제공


## 5. 개선 목표
- 코드 리팩토링 : 로직 효율성과 모듈화 등 일부 코드 리팩토링이 필요합니다.
- 메인 페이지 딜레이 개선 : 메인 화면 로딩 시 지도가 표시되는 데 소요되는 딜레이 개선이 필요합니다

## 6. 프로젝트 후기


