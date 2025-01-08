interface Deck {
    id: number
    audioBuffer: AudioBuffer | null
    bufferSourceNode: AudioBufferSourceNode | null
    gainNode: GainNode
    crossFadeNode: GainNode
    startTime: number
    pausedAt: number
    isPlaying: boolean
}

class AudioManager {
    private audioContext: AudioContext
    private nextId = 1
    private decks: Deck[] = []
    private crossFade = 0.5

    constructor() {
        this.audioContext = new AudioContext()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck(): Deck {
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        crossFadeNode.gain.value = this.crossFade

        gainNode.connect(crossFadeNode).connect(this.audioContext.destination)

        const deck: Deck = {
            id: this.nextId++,
            audioBuffer: null,
            bufferSourceNode: null,
            gainNode,
            crossFadeNode,
            startTime: 0,
            pausedAt: 0,
            isPlaying: false,
        }

        this.decks.push(deck)
        return deck
    }

    /** 특정 데크에 파일 로드 */
    async loadTrack(deckId: number, url: string) {
        const deck = this.getDeck(deckId)
        if (!deck) return

        try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
            deck.audioBuffer = await audioBuffer
        } catch (error) {
            console.error('Failed to load audio file:', error)
        }

        this.stopDeck(deckId)
        this.playDeck(deckId)
    }

    /**
     * AudioBufferSourceNode 생성(재생 시마다 새로 생성해야 함)
     */
    private createSourceNode(deck: Deck): AudioBufferSourceNode {
        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = deck.audioBuffer!
        sourceNode.connect(deck.gainNode)
        return sourceNode
    }

    /** 재생 */
    async playDeck(deckId: number) {
        const deck = this.getDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        // AudioContext가 suspend 상태라면 resume
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        // 이미 재생 중이면 무시(또는 stop 후 다시 재생 등 원하는 로직)
        if (deck.isPlaying) return

        // 새 AudioBufferSourceNode 생성
        deck.bufferSourceNode = this.createSourceNode(deck)

        // pausedAt 지점부터 재생 시작
        deck.bufferSourceNode.start(0, deck.pausedAt)

        // 재생 시작 시간(AudioContext의 currentTime 기준)
        deck.startTime = this.audioContext.currentTime - deck.pausedAt
        deck.isPlaying = true
    }

    /** 일시정지 */
    pauseDeck(deckId: number) {
        const deck = this.getDeck(deckId)
        if (!deck || !deck.bufferSourceNode || !deck.isPlaying) return

        // AudioBufferSourceNode는 한 번 stop()하면 재사용 불가
        deck.bufferSourceNode.stop()

        // 현재까지 재생된 시간
        const elapsed = this.audioContext.currentTime - deck.startTime

        // pausedAt을 갱신해 놓으면, 다음에 playDeck() 할 때 이어서 재생 가능
        deck.pausedAt = elapsed
        deck.isPlaying = false
        deck.bufferSourceNode = null
    }

    stopDeck(deckId: number) {
        const deck = this.getDeck(deckId)
        if (!deck) return

        deck.pausedAt = 0
        this.pauseDeck(deckId)
    }

    /** 개별 볼륨 조절 */
    setVolume(deckId: number, volume: number) {
        const deck = this.getDeck(deckId)
        if (!deck) return
        deck.gainNode.gain.value = volume
    }

    /** 크로스페이드 조절 */
    setCrossFade(value: number) {
        this.crossFade = value
        // this.decks[0].crossFadeNode.gain.value = 1 - value
        // this.decks[1].crossFadeNode.gain.value = value

        // smoothing
        this.decks[0].crossFadeNode.gain.value = Math.cos((value * Math.PI) / 2)
        this.decks[1].crossFadeNode.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
    }

    /** 현재 재생 위치(초 단위) */
    getCurrentTime(deckId: number): number {
        const deck = this.getDeck(deckId)
        if (!deck) return 0

        // 재생 중이면, (오디오컨텍스트현재시간 - startTime) = 현재까지 재생된 시간
        // 일시정지 상태라면 pausedAt을 그대로 반환
        return deck.isPlaying ? this.audioContext.currentTime - deck.startTime : deck.pausedAt
    }

    /** 전체 재생 길이(초 단위) */
    getDuration(deckId: number): number {
        const deck = this.getDeck(deckId)
        return deck?.audioBuffer?.duration ?? 0
    }

    getVolume(deckId: number): number {
        return this.getDeck(deckId)?.gainNode.gain.value ?? 0
    }

    getCrossFade(): number {
        return this.crossFade
    }

    /** 재생 중 여부 */
    isPlaying(deckId: number): boolean {
        const deck = this.getDeck(deckId)
        return deck ? deck.isPlaying : false
    }

    debugManager(): void {
        const now = Date.now()
        if (now - this.lastDebugTime >= 5000) {
            console.log(this.decks)
            this.lastDebugTime = now
        }
    }

    private getDeck(deckId: number): Deck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }

    private lastDebugTime = 0
}

// 자바스크립트(ES Modules)에서는 어떤 모듈을 한 번 로드하면, 해당 모듈이 캐싱되어 애플리케이션 전체에서 동일한 인스턴스를 공유함

/** @Singleton */
export const audioManager = new AudioManager()
