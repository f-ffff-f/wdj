export const DECK_IDS = ['a', 'b'] as const
// 이름과 구조 더 훌륭하게 바꿔야됨

// 오디오 초기값 설정
export const DECK_CONFIG = {
    currentTrack: null,
    playPosition: 0,
    volume: 1.0,
    isPlaying: false,
} as const

// 오디오 플레이어 설정
export const PLAYER_NODE_CONFIG = {
    fadeIn: 0,
    fadeOut: 0,
    loop: false,
    autostart: false,
    debug: true,
} as const

// 크로스페이더 설정
export const CROSSFADE_NODE_DEFAULT = 0.5 as const

export const GAIN_NODE_DEFAULT = 1.0 as const
