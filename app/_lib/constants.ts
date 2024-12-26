export const DECK_IDS = ['a', 'b'] as const
export type TDeckIds = typeof DECK_IDS

// 오디오 초기값 설정
export const AUDIO_DEFAULTS = {
    currentTrack: null,
    playPosition: 0,
    volume: 1.0,
    isPlaying: false,
} as const

// 오디오 플레이어 설정
export const PLAYER_CONFIG = {
    fadeIn: 0,
    fadeOut: 0,
    loop: false,
    autostart: false,
} as const

// 크로스페이더 설정
export const CROSSFADER_CONFIG = {
    DEFAULT: 0.5,
} as const

export const GAIN_CONFIG = {
    DEFAULT: 1.0,
} as const
