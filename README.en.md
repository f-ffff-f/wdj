# DJ Mixing Web Application [Alpha]

[한국어](README.md) | English

A modern DJ mixing web application that runs in the browser.

## Preview

[https://wdj-delta.vercel.app](https://wdj-delta.vercel.app)

## Getting Started

1. Press Enter or click "Choose File" to upload an audio file.
2. Load the audio file onto a deck by pressing the left or right arrow keys, or by clicking the buttons on either end of the item.
3. Go back to Step 1.
4. Repeat Step 2 to load a different audio file onto the other deck.

## Start the Local Development Server

1. Install Docker.
2. Run `docker-compose up app-dev` in the project root directory.

## Prototype Development Status

-   [x] Dual Deck System
-   [x] Crossfader controls
-   [x] Local music library management
    -   [x] Advanced features
-   [x] Real-time waveform visualization
-   [x] Keyboard controls
-   [x] Audio Effects
    -   [x] Speed control
-   [x] Server Development
    -   [ ] Advanced features
-   [ ] MIDI controls

### tech stack

-   [Next.js 14](https://nextjs.org/)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Web Audio API](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API)
-   [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
-   [Valtio](https://github.com/pmndrs/valtio)
-   [TailwindCSS](https://tailwindcss.com/)
-   [Prisma](https://www.prisma.io)
-   [PostgreSQL](https://www.postgresql.org)

## License

GPL (GNU General Public License) - see the [LICENSE](LICENSE) file for details.

## Contributing

1. fork this repository
2. create a new feature branch (`git checkout -b feat/amazing-feature`)
3. commit your changes (`git commit -m 'feat: add amazing feature'`)
4. push to the branch (`git push origin feat/amazing-feature`)
5. generate a pull request

## Credits

This project is based on [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
