# DJ Mixing Web Application

[English](README.en.md) | 한국어

DJ 웹 애플리케이션입니다.

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## 시작하기

1. 게스트로 시작하거나 로그인할 수 있습니다.
2. Enter를 누르거나 파일 선택을 클릭하여 오디오 파일을 업로드합니다.
3. 왼쪽, 오른쪽 화살표를 누르거나 아이템의 양쪽 끝 버튼을 눌러서 덱에 오디오 파일을 로드합니다.
4. 스텝 2로 돌아가서 다른쪽 덱에 오디오 파일을 로드합니다.

## 기술 스택

-   [Next.js 15](https://nextjs.org/) - 풀스택 프레임워크
-   [TypeScript](https://www.typescriptlang.org/) - 정적 타입 시스템
-   [React Query](https://tanstack.com/query/latest) - 서버 상태 관리
-   [Valtio](https://github.com/pmndrs/valtio) - 클라이언트 상태 관리
-   [NextAuth](https://next-auth.js.org/) - 인증 시스템
-   [Prisma](https://www.prisma.io) - ORM
-   [PostgreSQL](https://www.postgresql.org) - 데이터베이스
-   [Zod](https://zod.dev/) - 스키마 검증
-   [Web Audio API](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API) - 오디오 처리
-   [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 오디오 그래프 시각화
-   [TailwindCSS](https://tailwindcss.com/) - UI 스타일링
-   [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
-   [Playwright](https://playwright.dev) - E2E 테스팅

## 시스템 아키텍처

### 1. 공유 아키텍처
1. **NextAuth**  
   - OAuth 및 자격 증명 기반 로그인 지원  
   - 미들웨어를 활용한 세션 관리 및 인증 보호
 
2. **Zod**  
   - 프론트엔드에서 사용자 입력의 유효성 검사  
   - 백엔드에서 API 요청 및 응답 데이터의 스키마 검증  
   - Prisma와 결합하여 안전한 데이터 저장 및 조회

### 2. 프론트엔드 아키텍처

1. **UI/UX**  
   - Tailwind CSS와 shadcn/ui를 활용한 모던한 UI 구현  
   - 다크/라이트 모드 지원  
   - 반응형 디자인  
   - 재사용 가능한 컴포넌트 시스템  

1. **UI/UX**  
   - Tailwind CSS와 shadcn/ui를 활용한 모던한 UI 구현  
   - 다크/라이트 모드 지원  
   - 반응형 디자인  
   - 재사용 가능한 컴포넌트 시스템   

3. **상태 관리**  
   - React Query를 통한 서버 상태 관리 및 데이터 캐싱  
   - API 응답을 클라이언트에서 캐싱하여 성능 최적화  
   - 자동 리패칭 및 동기화 기능 활용  
   - 비동기 데이터 관리의 일관성 유지  
   - 긍정적 렌더링으로 UX 향상  
   - Valtio를 활용한 전역 상태 관리  
   - IndexedDB를 활용한 로컬 오디오 파일 캐싱  

### 3. 백엔드 아키텍처
1. 인증 시스템  
    - JWT 기반 인증  
    - 미들웨어를 통한 인증 보호  

2. 데이터베이스 설계  
   - Prisma ORM을 활용한 타입 안전성 확보  
   - PostgreSQL 데이터베이스 활용  

### 4. 인프라스트럭처
1. **서버리스 배포**
   - Vercel을 활용한 배포
   - Next.js Edge Runtime 활용  
   - 자동화된 CI/CD 파이프라인  
   - 글로벌 CDN을 통한 정적 자산 제공  
2. **클라우드 데이터베이스**  
   - Neon Serverless PostgreSQL 활용  
     - 자동 스케일링  
     - 브랜치 기능을 통한 개발/프로덕션 환경 분리  
     - 글로벌 리전 지원  

3. **클라우드 스토리지**
   - AWS S3를 활용한 오디오 파일 저장    
   - Presigned URL을 통한 보안 강화  

4. **개발환경 컨테이너화**
   - Docker 및 Docker Compose를 활용한 로컬 개발 환경 구성  
   - 개발/프로덕션 환경 일관성 확보  

### 5. 테스트 및 품질 관리  
1. **E2E 테스트**  
   - Playwright를 활용한 전체적인 UI 및 기능 검증  

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
