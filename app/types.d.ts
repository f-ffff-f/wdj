interface Window {
  webkitAudioContext: typeof AudioContext;
}

declare module '*.mp3' {
  const src: string;
  export default src;
} 