interface Window {
    webkitAudioContext: typeof AudioContext
    _cbTurnstile: (token: string) => void
}

declare module '*.mp3' {
    const src: string
    export default src
}
