export interface Deck {
    id: number
    audioElement: HTMLAudioElement
    sourceNode: MediaElementAudioSourceNode
    gainNode: GainNode
    crossFadeNode: GainNode
}

export class MediaElementAudioManager {
    private audioContext: AudioContext
    private decks: Deck[] = []
    private nextId = 1

    constructor() {
        this.audioContext = new AudioContext()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck(): Deck {
        const audioElement = new Audio()
        const sourceNode = this.audioContext.createMediaElementSource(audioElement)
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        // crossFadeNode.gain.value = 0.1 연결 확인
        // 최종 오디오 그래프: source -> gain -> crossFade -> destination
        sourceNode.connect(gainNode).connect(crossFadeNode).connect(this.audioContext.destination)

        const deck: Deck = {
            id: this.nextId++,
            audioElement,
            sourceNode,
            gainNode,
            crossFadeNode,
        }
        this.decks.push(deck)
        return deck
    }

    /** 특정 데크에 파일 로드 */
    loadTrack(deckId: number, url: string) {
        const deck = this.getDeck(deckId)
        if (!deck) return
        deck.audioElement.src = url
        deck.audioElement.autoplay = true
    }

    /** 재생 */
    async playDeck(deckId: number) {
        const deck = this.getDeck(deckId)
        if (!deck) return
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
        }
        deck.audioElement.play()
    }

    /** 일시정지 */
    pauseDeck(deckId: number) {
        const deck = this.getDeck(deckId)
        if (!deck) return
        deck.audioElement.pause()
    }

    /** 개별 볼륨 조절 */
    setVolume(deckId: number, volume: number) {
        const deck = this.getDeck(deckId)
        if (!deck) return
        deck.gainNode.gain.value = volume
    }

    /** 크로스페이드 조절 */
    setCrossFade(value: number) {
        this.decks[0].crossFadeNode.gain.value = 1 - value
        this.decks[1].crossFadeNode.gain.value = value
    }

    // 나머지 유틸 메서드
    getCurrentTime(deckId: number): number {
        return this.getDeck(deckId)?.audioElement.currentTime ?? 0
    }

    getDuration(deckId: number): number {
        return this.getDeck(deckId)?.audioElement.duration ?? 0
    }

    isPlaying(deckId: number): boolean {
        const deck = this.getDeck(deckId)
        return deck ? !deck.audioElement.paused && !deck.audioElement.ended : false
    }

    private getDeck(deckId: number): Deck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }
}
