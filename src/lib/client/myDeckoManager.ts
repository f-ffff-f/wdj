// Decko.ts
import { state, TDeckIds } from './state' // valtio 상태 가져오기
import { ref } from 'valtio' // ref 사용

// Decko 클래스: 오디오 로직 컨트롤러
export class DeckoManager {
    // AudioContext는 valtio 상태에서 가져오거나 여기서 생성 (valtio 상태에서 관리 권장)
    private audioContext: AudioContext
    private masterGainNode: GainNode | null = null

    // 비직렬화 객체 (AudioNode, AudioBuffer)는 valtio 상태 외부에 저장
    // Map을 사용하여 Deck ID로 관리
    private gainNodes = new Map<TDeckIds, GainNode>()
    private crossFadeNodes = new Map<TDeckIds, GainNode>()
    private bufferSourceNodes = new Map<TDeckIds, AudioBufferSourceNode | null>()
    audioBuffers = new Map<TDeckIds, AudioBuffer | null>() // AudioBuffer 저장

    constructor() {
        let audioContext: AudioContext | null = null
        // valtio 상태의 AudioContext 사용
        // 서버 사이드 렌더링 등 window 객체가 없는 환경 고려
        if (typeof window !== 'undefined') {
            audioContext = ref(new AudioContext()) // ref로 감싸서 프록시 해제
        } else {
            console.warn('AudioContext cannot be created outside of a browser environment.')
            // AudioContext가 필요한 기능은 클라이언트 측에서만 실행되도록 방어 코드 필요
        }
        // AudioContext가 null일 수 있으므로 non-null assertion 사용 시 주의
        this.audioContext = audioContext!

        // AudioContext가 성공적으로 생성되었을 때만 초기화 진행
        if (this.audioContext) {
            this.init()
        }
    }

    // 초기화: 마스터 게인 및 Deck 설정
    init() {
        if (!this.audioContext) return // AudioContext 없으면 중단

        this.masterGainNode = this.audioContext.createGain()
        // 마스터 볼륨 조절 (예: 0.5)
        this.masterGainNode.gain.value = 0.5
        this.masterGainNode.connect(this.audioContext.destination)

        // valtio 상태에 정의된 Deck들을 기반으로 노드 생성 및 연결
        this.setupDeck(1, this.masterGainNode)
        this.setupDeck(2, this.masterGainNode)

        // 초기 크로스페이드 값 적용
        this.applyCrossFade(state.crossFade)
    }

    // Deck 설정 (ID 기반)
    private setupDeck(deckId: TDeckIds, masterGainNode: GainNode) {
        if (!this.audioContext || !state.decks[deckId]) return // 방어 코드

        const deckState = state.decks[deckId]! // Non-null assertion (상태가 있다고 가정)

        // 오디오 노드 생성
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()

        // 노드 연결: Source -> Gain -> CrossFade -> Master
        gainNode.connect(crossFadeNode).connect(masterGainNode)

        // 노드 Map에 저장
        this.gainNodes.set(deckId, gainNode)
        this.crossFadeNodes.set(deckId, crossFadeNode)
        this.bufferSourceNodes.set(deckId, null) // 초기에는 소스 없음
        this.audioBuffers.set(deckId, null) // 초기에는 버퍼 없음

        // valtio 상태에 저장된 초기 볼륨 적용
        gainNode.gain.value = this.clampGain(deckState.volume)
        // 초기 크로스페이드 값은 init에서 한 번에 적용
    }

    // 특정 데크에 파일 로드
    async loadTrack(deckId: TDeckIds, blob: Blob) {
        const deckState = state.decks[deckId]
        if (!deckState || !this.audioContext) return

        // 기존 재생 중지 및 리소스 해제
        if (deckState.isPlaying) {
            this.stopDeckInternal(deckId, 0) // 0초부터 다시 시작하도록 설정
        }
        this.releaseBufferSourceNode(deckId) // 이전 소스 노드 확실히 해제

        deckState.isTrackLoading = true // valtio 상태 업데이트 -> UI 반응
        deckState.audioBufferLoaded = false
        deckState.duration = 0
        this.audioBuffers.set(deckId, null) // 내부 버퍼 초기화

        try {
            const arrayBuffer = await blob.arrayBuffer()
            // AudioContext 상태 확인 및 활성화 (사용자 인터랙션 후)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume()
            }
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

            // 내부 Map에 AudioBuffer 저장
            this.audioBuffers.set(deckId, audioBuffer)

            // valtio 상태 업데이트
            deckState.audioBufferLoaded = true
            deckState.duration = audioBuffer.duration
            deckState.valtio_nextStartTime = 0 // 로드 후 처음 위치는 0초
        } catch (error) {
            console.error(`[Deck ${deckId}] Failed to load audio file:`, error)
            // 실패 시 상태 초기화
            deckState.audioBufferLoaded = false
            deckState.duration = 0
            this.audioBuffers.set(deckId, null)
        } finally {
            deckState.isTrackLoading = false // 로딩 상태 종료 (valtio 업데이트)
        }
    }

    // 재생/일시정지 토글
    async playPauseDeck(deckId: TDeckIds) {
        const deckState = state.decks[deckId]
        const audioBuffer = this.audioBuffers.get(deckId)

        if (!deckState || !audioBuffer || !this.audioContext) {
            console.warn(`[Deck ${deckId}] Cannot play/pause: Deck state or buffer not ready.`)
            return
        }

        // AudioContext 활성화 (필요한 경우)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        if (deckState.isPlaying) {
            // --- 일시정지 ---
            const currentPlaybackTime = this.getPlaybackTime(deckId) // 정지 시점 기록
            this.stopDeckInternal(deckId, currentPlaybackTime)
        } else {
            // --- 재생 ---
            this.releaseBufferSourceNode(deckId) // 혹시 모를 이전 노드 해제

            const sourceNode = this.createSourceNode(deckId, audioBuffer)
            if (!sourceNode) return // 생성 실패 시 중단

            this.bufferSourceNodes.set(deckId, sourceNode) // 새 노드 저장

            // 재생 시작 (valtio 상태의 nextStartTime 사용)
            sourceNode.start(0, deckState.valtio_nextStartTime)

            // valtio 상태 업데이트
            deckState.valtio_prevStartTime = this.audioContext.currentTime // 재생 시작 시점 기록
            deckState.isPlaying = true
        }
    }

    // 데크 탐색 (Seeking)
    seekDeck(deckId: TDeckIds, seekTime: number) {
        const deckState = state.decks[deckId]
        const audioBuffer = this.audioBuffers.get(deckId)

        if (!deckState || !audioBuffer || !this.audioContext) return

        // 유효한 시간 범위로 제한
        const validSeekTime = Math.max(0, Math.min(seekTime, deckState.duration))

        deckState.isSeeking = true // valtio 상태 업데이트

        if (deckState.isPlaying) {
            // 재생 중이었다면: 현재 재생 중지 -> 새 시간으로 상태 업데이트 -> 다시 재생
            this.stopDeckInternal(deckId, validSeekTime) // 내부 정지 (nextStartTime 업데이트)
            this.playPauseDeck(deckId) // 다시 재생 시작
        } else {
            // 정지 상태였다면: 다음 재생 시작 시간만 업데이트
            deckState.valtio_nextStartTime = validSeekTime
        }

        // isSeeking 상태는 짧게 유지되거나, UI 업데이트 후 해제 필요 시 타이머 사용 가능
        // 여기서는 즉시 해제
        deckState.isSeeking = false // valtio 상태 업데이트
    }

    // 개별 볼륨 조절
    setVolume(deckId: TDeckIds, volume: number) {
        const deckState = state.decks[deckId]
        const gainNode = this.gainNodes.get(deckId)

        if (!deckState || !gainNode) return

        const clampedVolume = this.clampGain(volume)
        deckState.volume = clampedVolume // valtio 상태 업데이트
        gainNode.gain.linearRampToValueAtTime(clampedVolume, this.audioContext!.currentTime + 0.05) // 부드러운 변경
    }

    // 개별 속도 조절
    setSpeed(deckId: TDeckIds, speed: number) {
        const deckState = state.decks[deckId]
        const bufferSourceNode = this.bufferSourceNodes.get(deckId)

        if (!deckState) return

        const clampedSpeed = Math.max(0.1, Math.min(speed, 4)) // 속도 범위 예시
        deckState.speed = clampedSpeed // valtio 상태 업데이트

        // 재생 중인 경우에만 AudioNode 속성 직접 변경
        if (bufferSourceNode && deckState.isPlaying) {
            // 재생 중 속도 변경 시, 현재 재생 위치 재계산 및 반영 필요
            // 1. 현재 재생 시간 계산
            const currentPlaybackTime = this.getPlaybackTime(deckId)
            // 2. 잠시 멈춤 (내부 상태 업데이트)
            this.stopDeckInternal(deckId, currentPlaybackTime)
            // 3. 다시 재생 (playPauseDeck이 새 속도 적용)
            this.playPauseDeck(deckId)
            // 또는 bufferSourceNode.playbackRate.linearRampToValueAtTime(clampedSpeed, this.audioContext!.currentTime + 0.05); // 부드러운 변경 (더 간단)
        }
        // 정지 중일 때는 valtio 상태만 변경해두면 다음에 재생 시 반영됨
    }

    // 크로스페이드 조절
    setCrossFade(value: number) {
        const clampedValue = this.clampGain(value)
        state.crossFade = clampedValue // valtio 상태 업데이트
        this.applyCrossFade(clampedValue) // 실제 오디오 노드에 적용
    }

    // --- 내부 헬퍼 함수 ---

    // Deck 정지 로직 (내부 사용)
    private stopDeckInternal(deckId: TDeckIds, nextStartTime: number) {
        const deckState = state.decks[deckId]
        if (!deckState) return

        this.releaseBufferSourceNode(deckId) // 현재 소스 노드 정지 및 해제

        // valtio 상태 업데이트
        deckState.valtio_nextStartTime = nextStartTime // 정지 시점 또는 다음 시작 시간 기록
        deckState.isPlaying = false
    }

    // 크로스페이드 값을 실제 노드에 적용
    private applyCrossFade(value: number) {
        const crossFadeNode1 = this.crossFadeNodes.get(1)
        const crossFadeNode2 = this.crossFadeNodes.get(2)

        // Equal Power Crossfade 공식 사용
        const gain1 = Math.cos((value * Math.PI) / 2)
        const gain2 = Math.cos(((1 - value) * Math.PI) / 2) // Math.sin((value * Math.PI) / 2); 와 동일

        if (crossFadeNode1) {
            crossFadeNode1.gain.linearRampToValueAtTime(gain1, this.audioContext!.currentTime + 0.05)
        }
        if (crossFadeNode2) {
            crossFadeNode2.gain.linearRampToValueAtTime(gain2, this.audioContext!.currentTime + 0.05)
        }
    }

    // 게인 값 범위 제한 (0 ~ 1)
    private clampGain(value: number): number {
        return Math.max(0, Math.min(1, value))
    }

    // 새 AudioBufferSourceNode 생성 및 연결
    private createSourceNode(deckId: TDeckIds, audioBuffer: AudioBuffer): AudioBufferSourceNode | null {
        if (!this.audioContext) return null
        const gainNode = this.gainNodes.get(deckId)
        const deckState = state.decks[deckId]

        if (!gainNode || !deckState) return null

        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = audioBuffer
        sourceNode.playbackRate.value = deckState.speed // 현재 속도 적용
        sourceNode.connect(gainNode) // 해당 Deck의 GainNode에 연결

        // 재생 종료 시 이벤트 리스너 (선택적: 자동 다음 곡 재생 등)
        sourceNode.onended = () => {
            // isPlaying 상태가 true일 때만 (즉, 자연스럽게 끝났을 때만) 처리
            if (state.decks[deckId]?.isPlaying) {
                this.stopDeckInternal(deckId, state.decks[deckId]!.duration) // 끝난 시간으로 업데이트
                console.log(`Deck ${deckId} finished playing.`)
                // 여기서 다음 트랙 로드 등의 로직 추가 가능
            }
        }

        return sourceNode
    }

    // BufferSourceNode 해제
    private releaseBufferSourceNode(deckId: TDeckIds) {
        const sourceNode = this.bufferSourceNodes.get(deckId)
        if (sourceNode) {
            try {
                sourceNode.stop() // 현재 재생 중지
            } catch (e) {
                // 이미 멈췄거나 상태가 적절하지 않을 때 오류 발생 가능성 있음
                // console.warn(`[Deck ${deckId}] Error stopping source node:`, e);
            }
            sourceNode.disconnect() // 연결 해제 (메모리 누수 방지)
            sourceNode.onended = null // 이벤트 리스너 제거
            this.bufferSourceNodes.set(deckId, null) // Map에서 제거
        }
    }

    // --- 상태 Getter 함수 (valtio 상태 기반) ---

    // 현재 재생 시간 계산 (UI 업데이트용)
    // 주의: 이 함수는 자주 호출될 수 있으므로 계산 비용 최소화
    getPlaybackTime(deckId: TDeckIds): number {
        const deckState = state.decks[deckId]
        if (!deckState || !this.audioContext) return 0

        if (deckState.isPlaying) {
            // 재생 중: 마지막 시작 시간부터 경과된 시간(속도 반영) + 시작 오프셋
            const elapsedTime = (this.audioContext.currentTime - deckState.valtio_prevStartTime) * deckState.speed
            const calculatedTime = deckState.valtio_nextStartTime + elapsedTime
            // 계산된 시간이 총 길이를 넘지 않도록 함
            return Math.min(calculatedTime, deckState.duration)
        } else {
            // 정지 중: 마지막으로 기록된 시작 시간
            return deckState.valtio_nextStartTime
        }
    }

    // 오디오 버퍼 총 길이 (valtio에서 직접 읽음)
    getAudioBufferDuration(deckId: TDeckIds): number {
        return state.decks[deckId]?.duration ?? 0
    }

    // 개별 볼륨 (valtio에서 직접 읽음)
    getVolume(deckId: TDeckIds): number {
        return state.decks[deckId]?.volume ?? 0
    }

    // 개별 속도 (valtio에서 직접 읽음)
    getSpeed(deckId: TDeckIds): number {
        return state.decks[deckId]?.speed ?? 1
    }

    // 크로스페이드 값 (valtio에서 직접 읽음)
    getCrossFade(): number {
        return state.crossFade
    }

    // 재생 여부 (valtio에서 직접 읽음)
    isPlaying(deckId: TDeckIds): boolean {
        return state.decks[deckId]?.isPlaying ?? false
    }

    // 로딩 상태 확인 (valtio에서 직접 읽음)
    isTrackLoading(deckId: TDeckIds): boolean {
        return state.decks[deckId]?.isTrackLoading ?? false
    }

    // 오디오 버퍼 로드 여부 확인 (valtio에서 직접 읽음)
    isAudioBufferLoaded(deckId: TDeckIds): boolean {
        return state.decks[deckId]?.audioBufferLoaded ?? false
    }

    // 디버그 정보 (필요 시 사용)
    // debugManager() {
    //     return `
    //     Valtio State: ${JSON.stringify(state)}
    //     Internal Buffers: ${JSON.stringify(this.audioBuffers)}
    //     Internal Source Nodes: ${JSON.stringify(this.bufferSourceNodes)}
    //     AudioContext Time: ${this.audioContext?.currentTime}
    //     Deck 1 Playback Time: ${this.getPlaybackTime(1)}
    //     Deck 2 Playback Time: ${this.getPlaybackTime(2)}
    //     `
    // }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const myDeckoManager = new DeckoManager()
