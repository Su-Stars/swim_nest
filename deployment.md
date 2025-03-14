## Deployment 전략

---

아직, `GitHub` 브랜치 전략에 대해서 보고 오지 않으셨다면, 

`code-management.md` 보시길 바랍니다.

<br/>

PM2 를 이용한 간편한 배포와, Minikube 를 이용한 무중단 배포를 사용할까 고민 중입니다.

**PM2**

* 깃허브에서 EC2 로 쉽게 github 코드를 올릴 수 있습니다.
* 인스턴스의 양도 간단히 명령어로 조절이 가능합니다.
* Slack 서버로 쉽게 로그를 보낼 수 있습니다.

**Minikube**

* PM2 와는 달리 더 상세히 환경을 조절할 수 있습니다.
* 단, 깃허브 트리거 시 도커 허브에 이미지를 등록해야 하며,
* 도커 허브에 새로운 이미지 등록 시, 
* EC2 에서 이를 트리거하여 새로운 이미지 기반의 docker container 실행이 필요합니다.
* GitHub 환경 변수 파일을 만들기 위해 SSH 기반의 명령어로 만들 수는 있지만,
* `kubectl edit secret` 명령어로 넣어놓는 것이 더 편합니다.
* 이것 말고도 수정할 것이 꽤 있습니다.


현재 지금 당장 배포를 시작한 것은 아니기 때문에,

선택되는 전략에 따라 CI / CD 파이프라인은 달라질 수 있습니다.
