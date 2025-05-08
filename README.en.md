# DJ Mixing Web Application

[한국어](README.md) | English

A DJ web application.

## Tech

### 1. Backend

1. **Database Design**

    - Below is an ERD visualizing the schema.

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

    - Type safety ensured through Prisma ORM
    - PostgreSQL database utilization

2. **Authentication System**

    - Authentication system using NextAuth
        - Credential-based login support
        - Session management through middleware
        - JWT-based authentication
    - Bot prevention using Cloudflare Turnstile
        - User verification for login and registration
        - Enhanced security for guest login
        - Server-side token validation

3. **Data Validation and Processing**
    - API request/response schema validation using Zod
    - Secure data handling integrated with Prisma

### 2. Frontend

1. **UI/UX**

    - Modern UI implementation using Tailwind CSS and shadcn/ui
        - Dark/Light mode support
        - Responsive design
        - Reusable component system

2. **State Management**

    - Server state management and data caching with React Query
        - Optimized performance through client-side API response caching
        - Utilization of automatic refetching and synchronization
        - Consistency in asynchronous data management
        - Enhanced UX through optimistic rendering
    - Global state management using Valtio
    - Local audio file caching using IndexedDB

3. **Validation**
    - User input validation using Zod
    - Type-safe form data handling with React Hook Form

### 3. Infrastructure

1. **Serverless Deployment**

    - Deployment using Vercel
    - Next.js Edge Runtime utilization
    - Automated CI/CD pipeline
    - Static asset delivery through global CDN

2. **Cloud Database**

    - Neon Serverless PostgreSQL utilization
        - Auto-scaling
        - Development/Production environment separation through branching
        - Global region support

3. **Cloud Storage**

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

    - Audio file storage using AWS S3
    - Enhanced security through Presigned URLs

4. **Development Environment Containerization**
    - Local development environment setup using Docker and Docker Compose

### 4. Testing and Quality Assurance

1. **E2E Testing**
    - Playwright
2. **Unit Testing**
    - Vitest

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## Getting Started

1. Start as a Guest or Log in.
2. Press Enter or click "Choose File" to upload an audio file.
3. Load the audio file onto a deck using left/right arrow keys or edge buttons.
4. Return to Step 2 and load another audio file onto the opposite deck.

## Development Environment Setup

Prerequisites

- **Docker** and **Docker Compose** must be installed.

Basic Commands

```sh
# Run containers in background
docker-compose up -d

# Check running containers
docker ps

# Stop and remove containers
docker-compose down

# Start existing containers
docker-compose start
```

## License

GPL (GNU General Public License) - See the [LICENSE](LICENSE) file for details.

## Credits

This project is based on [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
