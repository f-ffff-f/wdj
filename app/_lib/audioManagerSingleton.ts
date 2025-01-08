interface IDeck {
    id: number
    audioBuffer: AudioBuffer | null
    bufferSourceNode: AudioBufferSourceNode | null
    gainNode: GainNode
    crossFadeNode: GainNode
    startedAt: number
    pausedAt: number
    isPlaying: boolean
    isSeeking: boolean
}

class AudioManager {
    private audioContext: AudioContext
    private nextId = 1
    private decks: IDeck[] = []
    private crossFade = 0.5

    constructor() {
        this.audioContext = new AudioContext()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck(): IDeck {
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        crossFadeNode.gain.value = this.crossFade

        gainNode.connect(crossFadeNode).connect(this.audioContext.destination)

        const deck: IDeck = {
            id: this.nextId++,
            audioBuffer: null,
            bufferSourceNode: null,
            gainNode,
            crossFadeNode,
            startedAt: 0,
            pausedAt: 0,
            isPlaying: false,
            isSeeking: false,
        }

        this.decks.push(deck)
        return deck
    }

    /** 특정 데크에 파일 로드 */
    async loadTrack(deckId: number, url: string) {
        const deck = this.findDeck(deckId)
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
    private createSourceNode(deck: IDeck): AudioBufferSourceNode {
        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = deck.audioBuffer!
        sourceNode.connect(deck.gainNode)
        return sourceNode
    }

    /** 재생 */
    async playDeck(deckId: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        // AudioContext가 suspend 상태라면 resume
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        if (deck.isPlaying) return

        // 새 AudioBufferSourceNode 생성
        deck.bufferSourceNode = this.createSourceNode(deck)

        // pausedAt 지점부터 재생 시작
        deck.bufferSourceNode.start(0, deck.pausedAt)

        // 재생 시작 시간(AudioContext의 currentTime 기준)
        deck.startedAt = this.audioContext.currentTime - deck.pausedAt
        deck.isPlaying = true
    }

    /** 일시정지 */
    pauseDeck(deckId: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.bufferSourceNode || !deck.isPlaying) return

        // AudioBufferSourceNode는 한 번 stop()하면 재사용 불가
        deck.bufferSourceNode.stop()

        // 현재까지 재생된 시간
        const elapsed = this.audioContext.currentTime - deck.startedAt

        // pausedAt을 갱신해 놓으면, 다음에 playDeck() 할 때 이어서 재생 가능
        deck.pausedAt = elapsed
        deck.isPlaying = false
        deck.bufferSourceNode = null
    }

    /** 데크 정지 */
    stopDeck(deckId: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.bufferSourceNode || !deck.isPlaying) return

        deck.bufferSourceNode.stop()

        deck.pausedAt = 0
        deck.isPlaying = false
        deck.bufferSourceNode = null
    }

    /** 데크 이동 */
    seekDeck(deckId: number, time: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        // time 범위 조정 (0 ~ 곡 길이)
        if (time < 0) time = 0
        if (time > deck.audioBuffer.duration) {
            time = deck.audioBuffer.duration
        }

        deck.isSeeking = true

        // 현재 pausedAt 위치를 갱신 (재생 중이 아닐 때는, 다음번 playDeck() 호출 시점부터 이 위치에서 시작)
        deck.pausedAt = time

        // 만약 재생 중이라면 stop 후 다시 play
        if (!deck.isPlaying || !deck.bufferSourceNode) return
        // 현재 pausedAt 위치를 갱신
        deck.bufferSourceNode.stop()

        // pausedAt을 갱신해 놓으면, 다음에 playDeck() 할 때 이어서 재생 가능
        deck.pausedAt = time
        deck.isPlaying = false
        deck.bufferSourceNode = null

        // 그 지점부터 재생
        this.playDeck(deckId)

        deck.isSeeking = false
    }

    /** 현재 재생 위치(초 단위) */
    getCurrentTime(deckId: number): number {
        const deck = this.findDeck(deckId)
        if (!deck) return 0

        // 재생 중이면, (오디오컨텍스트현재시간 - startedAt) = 현재까지 재생된 시간
        // 일시정지 상태라면 pausedAt을 그대로 반환
        return deck.isPlaying ? this.audioContext.currentTime - deck.startedAt : deck.pausedAt
    }

    getPausedAt(deckId: number): number {
        const deck = this.findDeck(deckId)
        return deck ? deck.pausedAt : 0
    }

    /** 개별 볼륨 조절 */
    setVolume(deckId: number, volume: number) {
        const deck = this.findDeck(deckId)
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

    /** 전체 재생 길이(초 단위) */
    getDuration(deckId: number): number {
        const deck = this.findDeck(deckId)
        return deck?.audioBuffer?.duration ?? 0
    }

    getVolume(deckId: number): number {
        return this.findDeck(deckId)?.gainNode.gain.value ?? 0
    }

    getCrossFade(): number {
        return this.crossFade
    }

    isPlaying(deckId: number): boolean {
        const deck = this.findDeck(deckId)
        return deck ? deck.isPlaying : false
    }

    isSeeking(deckId: number): boolean {
        const deck = this.findDeck(deckId)
        return deck ? deck.isSeeking : false
    }

    private findDeck(deckId: number): IDeck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }

    private finalizeDeck(deck: IDeck, newPausedAt: number) {
        if (!deck.bufferSourceNode) {
            console.error('bufferSourceNode is not created')
            return
        }

        deck.bufferSourceNode.stop()
        deck.pausedAt = newPausedAt
        deck.isPlaying = false
        deck.bufferSourceNode = null
    }

    public debugManager() {
        const _decks = this.decks.map((deck) => ({
            id: deck.id,
            audioBuffer: deck.audioBuffer ? 'loaded' : 'not loaded',
            bufferSourceNode: deck.bufferSourceNode ? 'created' : 'not created',
            isPlaying: deck.isPlaying,
            pausedAt: deck.pausedAt.toFixed(0),
            startedAt: deck.startedAt.toFixed(0),
        }))

        const stinrg = JSON.stringify(_decks, null, 2)
            .replace(/^{|}$/g, '') // 맨 앞과 뒤의 중괄호 제거
            .replace(/"([^"]+)":/g, '$1:')

        return stinrg
    }
}

// 자바스크립트(ES Modules)에서는 어떤 모듈을 한 번 로드하면, 해당 모듈이 캐싱되어 애플리케이션 전체에서 동일한 인스턴스를 공유함

/** @Singleton */
export const audioManager = new AudioManager()
