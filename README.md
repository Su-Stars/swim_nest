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

`/api/v1/users` : (유저 도메인)

* `GET me` - 사용자는 자신의 정보를 조회할 수 있다.
* `DELETE me` - 사용자는 자신의 정보를 사이트에서 삭제하고, 로그아웃 할 수 있다.
* `PATCH me` - 사용자는 자신의 정보를 수정 할 수 있다.
* `GET me/reviews` - 사용자는 자신이 수영장을 리뷰한 기록을 조회할 수 있다.
* `POST image` - 사용자는 자신의 Profile 을 등록 할 수 있다.
* `DELETE image` - 사용자는 자신의 Profile 을 삭제 할 수 있다.
* `PATCH image` - 사용자는 자신의 Profile 을 수정 할 수 있다.

**Auth 도메인**

`/api/v1/auth` : (보안 도메인)

* `POST login` - 사이트에 로그인 할 수 있다. (Access, Refresh 토큰을 쿠키에 저장)
* `POST logout` - 사이트에서 로그아웃 할 수 있다. (쿠키에서 Access, Refresh 토큰을 삭제)
* `POST register` - 사이트에 회원가입 할 수 있다.
* `POST reset-password` - 자신의 비밀번호를 수정 할 수 있다.
* `POST email-verification` - 이미 이메일이 등록되어 있는지 확인 할 수 있다.

**Pools 도메인**

`api/v1/pools` : (수영장 정보 도메인)

* `GET /` - 키워드, 지역 두 변수를 기준으로 원하는 수영장 리스트를 가져온다. (Default : `page` : 1, `limit` : 10)
* `POST /` - 수영장 정보를 등록 할 수 있다.
* `GET :poolId` - 해당 수영장 ID 정보를 가져올 수 있다.
* `PATCH :poolId` - 관리자는 해당 수영장 정보를 변경할 수 있다.
* `DELETE :poolId` - 관리자는 해당 수영장을 삭제할 수 있다.
* `POST images/:poolId` - 관리자는 해당 수영장의 이미지를 등록할 수 있다.
* `PUT images/:pool_id` - 관리자는 해당 수영장의 이미지를 추가할 수 있다.
* `GET :poolId/reviews` - 해당 수영장에 등록된 리뷰를 가져올 수 있다.
* `POST :poolId/reviews` - 사용자는 해당 수영장에 리뷰를 등록할 수 있다.
* `PATCH :poolId/reviews/:reviewId` - 사용자는 해당 수영장에 등록한 리뷰를 수정할 수 있다.
* `DELETE :poolId/reviews/:reviewId` - 사용자는 해당 수영장에 등록한 리뷰를 삭제 할 수 있다.
* `POST :pool_id/bookmark` - 사용자는 해당 수영장을 북마크(즐겨찾기) 할 수 있다.
* `DELETE :pool_id/bookmark` - 사용자는 자신이 북마크 한 수영장을 다시 북마크 취소 할 수 있다.
* `GET :pool_id/bookmark` - 사용자는 자신이 해당 수영장을 북마크했는지 확인 할 수 있다.

**Reviews 도메인**

`api/v1/reviews` : (관리자 리뷰 조회 도메인)

* `GET /` - 관리자는 수영장에 등록되었던 모든 리뷰를 최신 순으로 볼 수 있다.

**Bookmarks 도메인**

`api/v1/bookmarks` : (수영장 북마크 도메인)

* `POST /` - 사용자는 body 값에 담겨진 수영장 id 를 북마크한다.
* `GET /` - 사용자는 해당 북마크 id 에 해당하는 수영장 정보를 가져온다.
* `DELETE :bookmark_id` - 사용자는 해당 북마크 id 레코드를 삭제한다. (즐겨찾기 취소)

**SwimLogs 도메인**

`api/v1/logs` : (사용자 스스로의 수영 기록 도메인)

* `POST /` - 사용자는 자신이 수행한 수영 기록을 등록 할 수 있다.
* `GET /` - 사용자는 쿼리로 주어지는 시간에 따라 기록을 내림차순으로 제공한다.
* `GET user-logs` - 관리자는 모든 사용자에 대해 기록된 운동 기록을 최신 순으로 조회 할 수 있다.
* `GET :log_id` - 사용자는 자신의 해당 수영 기록에 대한 정보를 모두 조회할 수 있다.
* `DELETE :log_id` - 사용자는 자신의 해당 수영 기록을 삭제 할 수 있다.

**Bulletin 도메인**

`api/v1/bulletin` :

`GET /` : 사이트에 접속한 사람들은 현재 사용자들이 기록한 수영 기록을 간략하게 20 개를 볼 수 있다.


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

**공담형**

- Access, Refresh 토큰을 구현하는 과정에서, 모든 토큰을 쿠키 내부의 JWT 토큰으로 만들어 보안을 향상시킬 수 있었습니다.
- 토큰 내부에 관리자 혹은 유저임을 증명하는 내용을 작성하면서, 보안 접근 레벨 별로 계층을 나누어 정보를 제공할 수 있음을 알게 되었습니다.
- 이번 프로젝트를 통해, 복잡하게 얽혀진 릴레이션을 TypeOrm 의 객체 표현식 relation 을 이용하여 편리하게 가져오는 방식을 배웠습니다.
- 프로젝트가 더 나아갔다면 Redis 를 통한 대화 방식을 구현했을 텐데, 기존의 pm2 관리에서 docker 관리로 마이그레이션 하게 되었을 예정이었습니다. 앞으로는 docker 를 통한 서버 배포 고도화를 노리기 위해 노력하겠습니다.


**박정환**

- **Type ORM 첫 사용**
    - **Nest js 첫 사용**
        - Nest js의 첫 사용에 놀랐지만 생각보다 쉬운 난이도라 학습에 있어서 어려움이 있지는 않았다.
        - Defult 디렉터리 구조가 있고 CLI를 통해 컨트롤러, 서비스, 모델을 만들 수 있어 아주 좋았다.
        - class, TypeScript 사용도 처음이라 어려움이 있었고 타입을 지정하는 것이 정말 애매하여 function의 반환 값 타입 명명은 하지 않게 되었다.
        - Common js를 사용하였지만 Nest Js에선 ECMAScript를 사용하면서 처음 사용해 봤다.
          ECMAScript는 자동으로 import가 적히는 것이 좋았다.
    - SQL을 작성하지 않는 것에 대해 가독성 부분에는 좋았으나 사용에 있어서 어려움이 있었다.
        - Relationship의 어려움/ 여러 테이블을 join하게 되면 복잡해 지는 것이 SQL보다 더 심한 것 같다. (개인적인 의견)
        - 설정할 것이 너무 많음
        - join, save 등등 많은 메서드
        - 간단한 CRUD에서 가져오는 이득은 많다.