export interface Deck {
    id: number
    audioElement: HTMLAudioElement
    sourceNode: MediaElementAudioSourceNode
    gainNode: GainNode
    crossFadeNode: GainNode
}

export class AudioManager {
    private audioContext: AudioContext
    private nextId = 1
    private decks: Deck[] = []
    private crossFade = 0.5

    constructor() {
        this.audioContext = new AudioContext()
    }

    /** 데크(Deck)를 새로 추가 */
    addDeck(): Deck {
        const audioElement = new Audio()
        const sourceNode = this.audioContext.createMediaElementSource(audioElement)
        const gainNode = this.audioContext.createGain()
        const crossFadeNode = this.audioContext.createGain()
        crossFadeNode.gain.value = this.crossFade

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
        this.crossFade = value
        // this.decks[0].crossFadeNode.gain.value = 1 - value
        // this.decks[1].crossFadeNode.gain.value = value

        // smoothing
        this.decks[0].crossFadeNode.gain.value = Math.cos((value * Math.PI) / 2)
        this.decks[1].crossFadeNode.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
    }

    getCurrentTime(deckId: number): number {
        return this.getDeck(deckId)?.audioElement.currentTime ?? 0
    }

    getDuration(deckId: number): number {
        return this.getDeck(deckId)?.audioElement.duration ?? 0
    }

    getVolume(deckId: number): number {
        return this.getDeck(deckId)?.gainNode.gain.value ?? 0
    }

    getCrossFade(): number {
        return this.crossFade
    }

    isPlaying(deckId: number): boolean {
        const deck = this.getDeck(deckId)
        return deck ? !deck.audioElement.paused && !deck.audioElement.ended : false
    }

    private getDeck(deckId: number): Deck | undefined {
        return this.decks.find((d) => d.id === deckId)
    }
}
