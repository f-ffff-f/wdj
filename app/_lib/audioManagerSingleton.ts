import { EDeckIds } from '@/app/_lib/types'
import { clampGain } from '@/app/_lib/utils'

interface IDeck {
    id: EDeckIds
    audioBuffer: AudioBuffer | null
    bufferSourceNode: AudioBufferSourceNode | null
    gainNode: GainNode
    crossFadeNode: GainNode
    speed: number
    prevStartTime: number
    nextStartTime: number
    isPlaying: boolean
    isSeeking: boolean
}

class AudioManager {
    private audioContext: AudioContext
    private nextId = EDeckIds.DECK_1
    private decks: IDeck[] = []
    private crossFadeValue = 0.5
    constructor() {
        this.audioContext = new AudioContext()
        this.addDeck()
        this.addDeck()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck() {
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        crossFadeNode.gain.value = this.crossFadeValue

        gainNode.connect(crossFadeNode).connect(this.audioContext.destination)

        const deck: IDeck = {
            id: this.nextId++ as EDeckIds,
            audioBuffer: null,
            bufferSourceNode: null,
            gainNode,
            crossFadeNode,
            speed: 1,
            prevStartTime: 0,
            nextStartTime: 0,
            isPlaying: false,
            isSeeking: false,
        }

        this.decks.push(deck)
        return deck
    }

    /** 특정 데크에 파일 로드 */
    async loadTrack(deckId: EDeckIds, url: string) {
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

        this.releaseBuffer(deck, 0)
        this.playPauseDeck(deckId)
    }

    /** 재생 정지 토글 */
    async playPauseDeck(deckId: EDeckIds) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }

        if (deck.isPlaying) {
            const playbackTime = this.getPlaybackTime(deckId)
            this.releaseBuffer(deck, playbackTime)
        } else {
            deck.bufferSourceNode = this.createSourceNode(deck) // 재생 시마다 새로 생성해야 함
            deck.bufferSourceNode.playbackRate.value = deck.speed
            deck.bufferSourceNode.start(0, deck.nextStartTime)
            deck.prevStartTime = this.getElapsedTime(deck.nextStartTime)
            deck.isPlaying = true
        }
    }

    /** 데크 이동 */
    seekDeck(deckId: EDeckIds, seekTime: number) {
        const deck = this.findDeck(deckId)
        if (!deck || !deck.audioBuffer) return

        if (seekTime < 0) seekTime = 0
        if (seekTime > deck.audioBuffer.duration) {
            seekTime = deck.audioBuffer.duration
        }

        deck.isSeeking = true

        if (deck.isPlaying) {
            this.releaseBuffer(deck, seekTime)
            this.playPauseDeck(deckId)
        } else {
            deck.nextStartTime = seekTime
        }

        deck.isSeeking = false
    }

    /** 개별 볼륨 조절 */
    setVolume(deckId: EDeckIds, volume: number) {
        const deck = this.findDeck(deckId)
        if (!deck) return
        deck.gainNode.gain.value = clampGain(volume)
    }

    /** 개별 속도 조절 */
    setSpeed(deckId: EDeckIds, speed: number) {
        const deck = this.findDeck(deckId)
        if (!deck) return
        deck.speed = speed

        if (!deck.bufferSourceNode) return
        deck.bufferSourceNode.playbackRate.value = speed
    }

    /** 크로스페이드 조절 */
    setCrossFade(value: number) {
        this.crossFadeValue = clampGain(value)
        if (this.decks[0]) {
            this.decks[0].crossFadeNode.gain.value = Math.cos((value * Math.PI) / 2)
        }
        if (this.decks[1]) {
            this.decks[1].crossFadeNode.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
        }
    }

    getDeck(deckId: EDeckIds): IDeck | undefined {
        return this.findDeck(deckId)
    }

    getAudioBuffer(deckId: EDeckIds): AudioBuffer | null {
        const deck = this.findDeck(deckId)
        return deck?.audioBuffer ?? null
    }

    /** 현재 플레이백 시간 */
    getPlaybackTime(deckId: EDeckIds): number {
        const deck = this.findDeck(deckId)
        if (!deck) return 0

        return deck.isPlaying ? this.getElapsedTime(deck.prevStartTime) : deck.nextStartTime
    }

    /** 전체 재생 길이 */
    getAudioBufferDuration(deckId: EDeckIds): number {
        const deck = this.findDeck(deckId)
        return deck?.audioBuffer?.duration ?? 0
    }

    /** 개별 볼륨 */
    getVolume(deckId: EDeckIds): number {
        return this.findDeck(deckId)?.gainNode.gain.value ?? 0
    }

    /** 개별 속도 */
    getSpeed(deckId: EDeckIds): number {
        return this.findDeck(deckId)?.speed ?? 1
    }

    /** 크로스페이드 */
    getCrossFade(): number {
        return this.crossFadeValue
    }

    /** 재생 여부 */
    isPlaying(deckId: EDeckIds): boolean {
        const deck = this.findDeck(deckId)
        return deck ? deck.isPlaying : false
    }

    /** 이동 여부 */
    isSeeking(deckId: EDeckIds): boolean {
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
    private findDeck(deckId: EDeckIds): IDeck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }

    /** 버퍼 해제 */
    private releaseBuffer(deck: IDeck, nextStartTime: number) {
        if (!deck.bufferSourceNode) {
            console.error('bufferSourceNode is not created')
            return
        }

        deck.bufferSourceNode.stop()
        deck.bufferSourceNode = null
        deck.nextStartTime = nextStartTime
        deck.isPlaying = false
    }

    /** 기록한 시간 부터 경과된 시간 */
    private getElapsedTime(lastRecordedTime: number): number {
        return this.audioContext.currentTime - lastRecordedTime
    }

    public debugManager() {
        const _decks = this.decks.map((deck) => ({
            id: deck.id,
            audioBuffer: deck.audioBuffer ? 'loaded' : 'not loaded',
            bufferSourceNode: deck.bufferSourceNode ? 'created' : 'not created',
            isPlaying: deck.isPlaying,
            nextStartTime: deck.nextStartTime.toFixed(0),
            prevStartTime: deck.prevStartTime.toFixed(0),
        }))

        const str = JSON.stringify(_decks, null, 2)
            .replace(/^{|}$/g, '')
            .replace(/"([^"]+)":/g, '$1:')

        return `${str}
this.audioContext.currentTime: ${this.audioContext.currentTime.toFixed(0)}`
    }
}

// 자바스크립트(ES Modules)에서는 어떤 모듈을 한 번 로드하면, 해당 모듈이 캐싱되어 애플리케이션 전체에서 동일한 인스턴스를 공유함

/** @Singleton */
export const audioManager = new AudioManager()
