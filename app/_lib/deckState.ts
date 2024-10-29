import { proxy, subscribe } from 'valtio'

interface ITrackInfo {
    id: string
    title: string
    artist: string
    duration: number
}

interface IDeckState {
    currentTrack: ITrackInfo | null
    playPosition: number
    volume: number
    isPlaying: boolean
    // 필요에 따라 추가 필드 작성
}

export const deckState = proxy({
    deck1: {
        currentTrack: null,
        playPosition: 0,
        volume: 1,
        isPlaying: false,
    } as IDeckState,
    deck2: {
        currentTrack: null,
        playPosition: 0,
        volume: 1,
        isPlaying: false,
    } as IDeckState,
})

subscribe(deckState, () => {
    console.log('State has changed:', JSON.stringify(deckState, null, 2))
})