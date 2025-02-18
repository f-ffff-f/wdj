# DJ Mixing Web Application [Alpha]

[English](README.en.md) | 한국어

DJ 웹 애플리케이션입니다.

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## 시작하기

1. Enter를 누르거나 파일 선택을 클릭하여 오디오 파일을 업로드합니다.
2. 왼쪽,오른쪽 화살표를 누르거나 아이템의 양쪽 끝 버튼을 눌러서 덱에 오디오 파일을 로드합니다.
3. 스텝 1으로 돌아갑니다.
4. 스텝 2로 돌아가서 다른쪽 덱에 오디오 파일을 로드합니다.


## 기술 스택

-   [Next.js 14](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Web Audio API](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API)
-   [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
-   [Valtio](https://github.com/pmndrs/valtio)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Prisma](https://www.prisma.io)
-   [PostgreSQL](https://www.postgresql.org)
-   [Playwright](https://playwright.dev)


## 시스템 아키텍처

### 1. 프론트엔드 아키텍처

#### 1.1 UI/UX
- Tailwind CSS와 shadcn/ui를 활용한 모던한 UI 구현
  - 다크/라이트 모드 지원
  - 반응형 디자인
  - 재사용 가능한 컴포넌트 시스템

#### 1.2 오디오 처리 시스템
- [decko](https://www.npmjs.com/package/@ghr95223/decko) 
  - Web Audio API를 기반으로 직접 제작한 패키지
  - 탐색, 크로스페이드, 볼륨 조절, 속도 조절 등 DJ 기능 구현

#### 1.3 상태 관리
- Valtio를 활용한 전역 상태 관리
- React Query를 통한 서버 상태 관리
- IndexedDB를 활용한 로컬 오디오 파일 캐싱

### 2. 백엔드 아키텍처

#### 2.1 인증 시스템
- JWT 기반 인증
- Guest/Member 역할 구분
- 미들웨어를 통한 인증 처리

#### 2.2 데이터베이스 설계
- Prisma ORM을 활용한 타입 안전성 확보
- PostgreSQL 데이터베이스 활용

### 3. 인프라스트럭처

#### 3.1 서버리스 배포
- Vercel을 활용한 서버리스 배포
  - Next.js Edge Runtime 활용
  - 자동화된 CI/CD 파이프라인
  - 글로벌 CDN을 통한 정적 자산 제공

#### 3.2 데이터베이스
- Neon Serverless PostgreSQL 활용
  - 자동 스케일링
  - 브랜치 기능을 통한 개발/프로덕션 환경 분리
  - 글로벌 리전 지원

#### 3.3 스토리지
- AWS S3를 활용한 오디오 파일 저장
- Presigned URL을 통한 보안 강화

#### 3.4 컨테이너화
- Docker 및 Docker Compose를 활용한 로컬 개발 환경 구성
- 개발/프로덕션 환경 일관성 확보

### 4. 테스트 및 품질 관리
- Playwright를 활용한 E2E 테스트

## 프로토타입 개발 현황

- [x] DJ 앱 코어
- [x] 백엔드
  - [x] 고도화
- [x] 전체 리팩토링
- [x] 반응형 UI
- [x] 코어 모듈 패키지화
- [ ] 회원가입
- [ ] seo 적용
- [ ] 테스트 커버리지 100% 달성
- [ ] 미디 컨트롤


## 개발 환경 시작하기

필수 요구 사항
- **Docker**와 **Docker Compose**가 설치되어 있어야 합니다.

기본 명령어
```sh
# 컨테이너를 백그라운드로 실행
docker-compose up -d

# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 중지 및 삭제
docker-compose down

# 기존 컨테이너 시작
docker-compose start
```

## 라이선스

GPL (GNU General Public License) - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 크레딧

이 프로젝트는 [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)을 기반으로 제작되었습니다.
