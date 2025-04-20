// state.ts
import { DECK_IDS, TDeckId } from '@/lib/client/constants'
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

// 각 Deck의 상태 인터페이스
interface IDeckState {
    id: TDeckId
    audioBufferLoaded: boolean
    duration: number
    speed: number
    valtio_prevStartTime: number
    valtio_nextStartTime: number
    isPlaying: boolean
    isSeeking: boolean
    isTrackLoading: boolean
    volume: number
    // UI 표시용 현재 재생 시간 필드 추가
    uiPlaybackTime: number
}

// 전체 상태 인터페이스
interface IState {
    UI: {
        focusedTrackId: string | null
        storageEstimate: StorageEstimate | null
    }
    decks: {
        [key in TDeckId]?: IDeckState
    }
    crossFade: number
}

// 초기 상태 정의
const initialDeckState = (id: TDeckId): IDeckState => ({
    id: id,
    audioBufferLoaded: false,
    duration: 0,
    speed: 1,
    valtio_prevStartTime: 0,
    valtio_nextStartTime: 0,
    isPlaying: false,
    isSeeking: false,
    isTrackLoading: false,
    volume: 0.8,
    uiPlaybackTime: 0, // uiPlaybackTime 초기화
})

export const state = proxy<IState>({
    UI: { focusedTrackId: null, storageEstimate: null },
    decks: {
        [DECK_IDS.ID_1]: initialDeckState(DECK_IDS.ID_1),
        [DECK_IDS.ID_2]: initialDeckState(DECK_IDS.ID_2),
    },
    crossFade: 0.5,
})

// devtools 설정
devtools(state, { name: 'state', enabled: true })

// --- 상태 업데이트 함수 (선택적) ---
export const updateStorageEstimate = async () => {
    if (navigator?.storage?.estimate) {
        try {
            const estimate = await navigator.storage.estimate()
            state.UI.storageEstimate = estimate
        } catch (error) {
            console.error('Failed to estimate storage:', error)
            state.UI.storageEstimate = null
        }
    }
}

export const setFocusedTrack = (id: string | null) => {
    state.UI.focusedTrackId = id
}
