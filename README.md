# DJ Mixing Web Application

[English](README.en.md) | 한국어

DJ 웹 애플리케이션입니다.

## 기술

### 1. 백엔드
1. **데이터베이스 설계**
    - 아래는 스키마를 시각화한 ERD입니다.

    ```mermaid
        erDiagram
            User {
                String id PK "uuid, default(uuid())"
                String email "nullable, unique"
                String password "nullable"
                Role role "default(MEMBER)"
                DateTime createdAt "default(now())"
            }

            Track {
                String id PK "uuid, default(uuid())"
                String fileName
                DateTime createdAt "default(now())"
                String userId FK "references User.id"
            }

            Playlist {
                String id PK "uuid, default(uuid())"
                String name
                DateTime createdAt "default(now())"
                DateTime updatedAt "updatedAt"
                String userId FK "references User.id"
            }

            Role {
                enum GUEST
                enum MEMBER
            }

            User ||--o{ Playlist : "owns / creates"
            User ||--o{ Track : "uploads"
            Playlist }o--o{ Track : "contains"
    ```
    - Prisma ORM을 활용한 타입 안전성 확보  
    - PostgreSQL 데이터베이스 활용 

2. **인증 시스템**  
    - NextAuth를 활용한 인증 시스템
      - 자격 증명 기반 로그인 지원
      - 미들웨어를 통한 세션 관리
      - JWT 기반 인증
    - Cloudflare Turnstile을 활용한 봇 방지
      - 로그인 및 회원가입 시 사용자 검증
      - 게스트 로그인 보안 강화
      - 서버 사이드 토큰 검증

3. **데이터 유효성 검사 및 처리**
   - Zod를 활용한 API 요청/응답 스키마 검증
   - Prisma와 결합한 안전한 데이터 처리 


### 2. 프론트엔드

1. **UI/UX**  
   - Tailwind CSS와 shadcn/ui를 활용한 모던한 UI 구현  
      - 다크/라이트 모드 지원  
      - 반응형 디자인  
      - 재사용 가능한 컴포넌트 시스템  

2. **상태 관리**  
   - React Query를 통한 서버 상태 관리 및 데이터 캐싱  
      - API 응답을 클라이언트에서 캐싱하여 성능 최적화  
      - 자동 리패칭 및 동기화 기능 활용  
      - 비동기 데이터 관리의 일관성 유지  
      - 긍정적 렌더링으로 UX 향상  
   - Valtio를 활용한 전역 상태 관리  
   - IndexedDB를 활용한 로컬 오디오 파일 캐싱  

3. **유효성 검사**
   - Zod를 활용한 사용자 입력의 유효성 검사
   - React Hook Form을 활용한 타입 안전성이 보장된 폼 데이터 처리

### 3. 인프라스트럭처
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
    - 아래는 플로우를 시각화한 차트입니다.
   ```mermaid
    flowchart TD
        subgraph 클라이언트 브라우저
            A[사용자 음원 업로드] --> B1[IndexedDB에 음원 캐싱]
            A --> |병렬 처리| B2[S3 업로드 요청]
        end
        
        subgraph 서버
            B2 --> C[Presigned-URL 생성]
            C --> D[Presigned-URL 반환]
            
            G[음원 ID로 데이터베이스 저장] --> H[Track 엔티티 생성]
            
            K[음원 요청 수신] --> L[S3 다운로드용 Presigned-URL 생성]
            L --> M[Presigned-URL 반환]
        end
        
        subgraph AWS S3
            D --> E[Presigned-URL로 S3에 업로드]
            E --> F[업로드 완료 신호]
            
            N[S3에서 음원 다운로드] --> O[음원 데이터 반환]
        end
        
        F --> G
        
        subgraph 음원 재생 프로세스
            I[음원 재생 요청] --> J{IndexedDB에 
            음원 존재?}
            J -->|Yes| P[로컬 캐시에서 음원 로드]
            J -->|No| K
            M --> N
            O --> Q[브라우저 IndexedDB에 캐싱]
            P --> R[음원 재생]
            Q --> R
        end
        
        classDef browser fill:#f9f,stroke:#333,stroke-width:2px;
        classDef server fill:#bbf,stroke:#333,stroke-width:2px;
        classDef aws fill:#ffa,stroke:#333,stroke-width:2px;
        classDef process fill:#afa,stroke:#333,stroke-width:2px;
        
        class A,B1,B2,I,J,P,Q,R browser;
        class C,D,G,H,K,L,M server;
        class E,F,N,O aws;
        class I,J,P,Q,R process;
    ```
   - AWS S3를 활용한 오디오 파일 저장    
   - Presigned URL을 통한 보안 강화  

4. **개발환경 컨테이너화**
   - Docker 및 Docker Compose를 활용한 로컬 개발 환경 구성  

### 4. 테스트 및 품질 관리  
1. **E2E 테스트**  
   - Playwright
2. **unit 테스트**
   - Vitest


## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## 시작하기

1. 게스트로 시작하거나 로그인할 수 있습니다.
2. Enter를 누르거나 파일 선택을 클릭하여 오디오 파일을 업로드합니다.
3. 왼쪽, 오른쪽 화살표를 누르거나 아이템의 양쪽 끝 버튼을 눌러서 덱에 오디오 파일을 로드합니다.
4. 스텝 2로 돌아가서 다른쪽 덱에 오디오 파일을 로드합니다.

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
