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

## Prototype Development Status

-   [x] DJ App Core
-   [x] Backend
    -   [x] Advanced features
-   [x] Full refactoring
-   [x] Responsive UI
-   [ ] User registration
-   [ ] SEO implementation
-   [ ] Achieve 100% test coverage
-   [ ] MIDI controls

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

## License

GPL (GNU General Public License) - See [LICENSE](LICENSE) file for details.

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## Credits

This project is based on [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)
