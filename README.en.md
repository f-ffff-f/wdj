# DJ Mixing Web Application [Alpha]

[한국어](README.md) | English

A modern DJ mixing web application that runs in the browser.

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## Getting Started

1. Press Enter or click "Choose File" to upload an audio file
2. Load the audio file onto a deck using left/right arrow keys or edge buttons
3. Return to Step 1
4. Load another audio file onto the opposite deck

## Tech Stack

-   [Next.js 14](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
-   [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
-   [Valtio](https://github.com/pmndrs/valtio)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Prisma](https://www.prisma.io)
-   [PostgreSQL](https://www.postgresql.org)
-   [Playwright](https://playwright.dev)

## System Architecture

### 1. Frontend Architecture

#### 1.1 UI/UX

-   Modern UI implementation using Tailwind CSS and shadcn/ui
    -   Dark/Light mode support
    -   Responsive design
    -   Reusable component system

#### 1.2 Audio Processing System

-   Singleton pattern audio manager based on Web Audio API
-   DJ features including crossfade, volume control, and speed adjustment
-   Buffer management system to prevent memory leaks

#### 1.3 State Management

-   Global state management with Valtio
-   Server state management using React Query
-   Local audio file caching with IndexedDB

### 2. Backend Architecture

#### 2.1 Authentication System

-   JWT-based authentication
-   Guest/Member role distinction
-   Authentication handling through middleware

#### 2.2 Database Design

-   Type safety using Prisma ORM
-   PostgreSQL database implementation

### 3. Infrastructure

#### 3.1 Serverless Deployment

-   Serverless deployment using Vercel
    -   Utilizing Next.js Edge Runtime
    -   Automated CI/CD pipeline
    -   Global CDN for static assets

#### 3.2 Database

-   Neon Serverless PostgreSQL
    -   Auto-scaling capabilities
    -   Development/Production environment separation using branching
    -   Global region support

#### 3.3 Storage

-   Audio file storage using AWS S3
-   Enhanced security with Presigned URLs

#### 3.4 Containerization

-   Local development environment using Docker and Docker Compose
-   Development/Production environment consistency

### 4. Testing and Quality Control

-   E2E testing with Playwright

## Development Status

-   [x] DJ App Core
-   [x] Backend
    -   [x] Advanced features
-   [x] Full refactoring
-   [x] Responsive UI
-   [ ] User registration
-   [ ] SEO implementation
-   [ ] Achieve 100% test coverage
-   [ ] MIDI controls

## Getting Started with Development

Prerequisites

-   **Docker** and **Docker Compose** must be installed

Basic Commands

```sh
# Start containers in detached mode
docker-compose up -d

# Check running containers
docker ps

# Stop and remove containers
docker-compose down

# Start existing containers
docker-compose start
```

## License

GPL (GNU General Public License) - See [LICENSE](LICENSE) file for details.

## Credits

This project is based on [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)
