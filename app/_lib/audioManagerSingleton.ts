interface IDeck {
    id: number
    audioBuffer: AudioBuffer | null
    bufferSourceNode: AudioBufferSourceNode | null
    gainNode: GainNode
    crossFadeNode: GainNode
    cachedStartTime: number
    playbackTime: number
    isPlaying: boolean
    isSeeking: boolean
}

class AudioManager {
    private audioContext: AudioContext
    private nextId = 1
    private decks: IDeck[] = []
    private crossFadeValue = 0.5

    constructor() {
        this.audioContext = new AudioContext()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck(): IDeck {
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        crossFadeNode.gain.value = this.crossFadeValue

        gainNode.connect(crossFadeNode).connect(this.audioContext.destination)

        const deck: IDeck = {
            id: this.nextId++,
            audioBuffer: null,
            bufferSourceNode: null,
            gainNode,
            crossFadeNode,
            cachedStartTime: 0,
            playbackTime: 0,
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
            deck.audioBuffer = audioBuffer
        } catch (error) {
            console.error('Failed to load audio file:', error)
        }

        this.finalizeDeck(deck, 0)
        this.playDeck(deckId)
    }

    /** 재생 */
    async playDeck(deckId: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        if (deck.isPlaying) return

        deck.bufferSourceNode = this.createSourceNode(deck) // 재생 시마다 새로 생성해야 함
        deck.bufferSourceNode.start(0, deck.playbackTime)
        deck.cachedStartTime = this.calcElapsedTime(deck.playbackTime)
        deck.isPlaying = true
    }

    /** 일시정지 */
    pauseDeck(deckId: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.bufferSourceNode || !deck.isPlaying) return
        const elapsed = this.calcElapsedTime(deck.cachedStartTime)
        this.finalizeDeck(deck, elapsed)
    }

    /** 데크 이동 */
    seekDeck(deckId: number, seekTime: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        if (seekTime < 0) seekTime = 0
        if (seekTime > deck.audioBuffer.duration) {
            seekTime = deck.audioBuffer.duration
        }

        deck.isSeeking = true

        if (deck.isPlaying) {
            this.finalizeDeck(deck, seekTime)
            this.playDeck(deckId)
        } else {
            deck.playbackTime = seekTime
        }

        deck.isSeeking = false
    }

    /** 개별 볼륨 조절 */
    setVolume(deckId: number, volume: number) {
        const deck = this.findDeck(deckId)
        if (!deck) return
        deck.gainNode.gain.value = volume
    }

    /** 크로스페이드 조절 */
    setCrossFade(value: number) {
        this.crossFadeValue = value
        if (this.decks[0]) {
            this.decks[0].crossFadeNode.gain.value = Math.cos((value * Math.PI) / 2)
        }
        if (this.decks[1]) {
            this.decks[1].crossFadeNode.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
        }
    }

    getAudioBuffer(deckId: number): AudioBuffer | null {
        const deck = this.findDeck(deckId)
        return deck?.audioBuffer ?? null
    }

    /** 현재 재생 위치 */
    getCurrentTime(deckId: number): number {
        const deck = this.findDeck(deckId)
        if (!deck) return 0
        return deck.isPlaying ? this.calcElapsedTime(deck.cachedStartTime) : deck.playbackTime
    }

    /** 전체 재생 길이 */
    getDuration(deckId: number): number {
        const deck = this.findDeck(deckId)
        return deck?.audioBuffer?.duration ?? 0
    }

    /** 일시정지 시간 */
    getPausedTime(deckId: number): number {
        const deck = this.findDeck(deckId)
        return deck ? deck.playbackTime : 0
    }

    /** 개별 볼륨 */
    getVolume(deckId: number): number {
        return this.findDeck(deckId)?.gainNode.gain.value ?? 0
    }

    /** 크로스페이드 */
    getCrossFade(): number {
        return this.crossFadeValue
    }

    /** 재생 여부 */
    isPlaying(deckId: number): boolean {
        const deck = this.findDeck(deckId)
        return deck ? deck.isPlaying : false
    }

    /** 이동 여부 */
    isSeeking(deckId: number): boolean {
        const deck = this.findDeck(deckId)
        return deck ? deck.isSeeking : false
    }

    /** AudioBufferSourceNode 생성 */
    private createSourceNode(deck: IDeck): AudioBufferSourceNode {
        const sourceNode = this.audioContext.createBufferSource()
        sourceNode.buffer = deck.audioBuffer
        sourceNode.connect(deck.gainNode)
        return sourceNode
    }

    /** 데크 찾기 */
    private findDeck(deckId: number): IDeck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }

    /** 데크 종료 */
    private finalizeDeck(deck: IDeck, newPlaybackTime: number) {
        if (!deck.bufferSourceNode) {
            console.error('bufferSourceNode is not created')
            return
        }

        deck.bufferSourceNode.stop()
        deck.playbackTime = newPlaybackTime
        deck.isPlaying = false
        deck.bufferSourceNode = null
    }

    private calcElapsedTime(lastTime: number): number {
        return this.audioContext.currentTime - lastTime
    }

    public debugManager() {
        const _decks = this.decks.map((deck) => ({
            id: deck.id,
            audioBuffer: deck.audioBuffer ? 'loaded' : 'not loaded',
            bufferSourceNode: deck.bufferSourceNode ? 'created' : 'not created',
            isPlaying: deck.isPlaying,
            playbackTime: deck.playbackTime.toFixed(0),
            cachedStartTime: deck.cachedStartTime.toFixed(0),
        }))

        const str = JSON.stringify(_decks, null, 2)
            .replace(/^{|}$/g, '')
            .replace(/"([^"]+)":/g, '$1:')

        return str
    }
}

// 자바스크립트(ES Modules)에서는 어떤 모듈을 한 번 로드하면, 해당 모듈이 캐싱되어 애플리케이션 전체에서 동일한 인스턴스를 공유함

/** @Singleton */
export const audioManager = new AudioManager()
