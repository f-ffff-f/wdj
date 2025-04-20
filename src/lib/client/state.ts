// state.ts
import { DECK_IDS, TDeckId } from '@/lib/client/constants'
import { proxy } from 'valtio' // ref 추가
import { devtools } from 'valtio/utils'

// 각 Deck의 상태 인터페이스
interface IDeckState {
    id: TDeckId
    audioBufferLoaded: boolean // AudioBuffer 직접 저장 대신 로드 여부 저장
    duration: number // 오디오 길이 저장
    speed: number
    // valtio 상태에 저장될 시작 시간 관련 필드 (이름 변경으로 구분)
    valtio_prevStartTime: number // 재생 시작 시 AudioContext.currentTime
    valtio_nextStartTime: number // 다음에 재생 시작할 오프셋 (초)
    isPlaying: boolean
    isSeeking: boolean
    isTrackLoading: boolean
    volume: number // 개별 볼륨 추가
}

// 전체 상태 인터페이스
interface IState {
    UI: {
        focusedTrackId: string | null // ID 타입 사용, null 가능
        storageEstimate: StorageEstimate | null
    }
    // Deck 상태를 저장할 객체 (ID를 키로 사용)
    decks: {
        [key in TDeckId]?: IDeckState // 각 Deck ID에 대한 상태
    }
    crossFade: number // 크로스페이드 값 추가
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
    volume: 0.8, // 초기 볼륨 예시
})

export const state = proxy<IState>({
    UI: { focusedTrackId: null, storageEstimate: null },
    decks: {
        [DECK_IDS.ID_1]: initialDeckState(DECK_IDS.ID_1),
        [DECK_IDS.ID_2]: initialDeckState(DECK_IDS.ID_2),
    },
    crossFade: 0.5, // 초기 크로스페이드 값
})

// Decko 컨트롤러 초기화 (아래 Decko.ts 참고)
// Decko 클래스가 valtio 상태를 직접 참조하도록 수정합니다.
// import { deckoManager } from './Decko'; // Decko.ts 경로에 맞게 수정
// deckoManager.init(); // Decko 생성자 또는 별도 init 메소드에서 AudioContext와 초기 Deck 설정

// devtools 설정
devtools(state, { name: 'state', enabled: true })

// --- 상태 업데이트 함수 (선택적) ---
// 기존 updateStorageEstimate는 유지
export const updateStorageEstimate = async () => {
    if (navigator?.storage?.estimate) {
        try {
            // 에러 처리 추가
            const estimate = await navigator.storage.estimate()
            state.UI.storageEstimate = estimate
        } catch (error) {
            console.error('Failed to estimate storage:', error)
            state.UI.storageEstimate = null // 실패 시 null 처리
        }
    }
}

// 예시: 포커스된 트랙 ID 설정 함수
export const setFocusedTrack = (id: string | null) => {
    state.UI.focusedTrackId = id
}

// 참고: Deck 관련 상태 업데이트는 Decko 클래스 메소드를 통해 수행하는 것이 좋습니다.
// (예: deckoManager.loadTrack, deckoManager.setVolume 등)
