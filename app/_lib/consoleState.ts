import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface ITrackInfo {
    id: string
    title: string
    artist: string
    duration: number
}

interface IDeck {
    currentTrack: ITrackInfo | null
    playPosition: number
    volume: number
    isPlaying: boolean
    // 필요에 따라 추가 필드 작성
}

export const consoleState = proxy({
    deck1: {
        currentTrack: null,
        playPosition: 0,
        volume: 1,
        isPlaying: false,
    } as IDeck,
    deck2: {
        currentTrack: null,
        playPosition: 0,
        volume: 1,
        isPlaying: false,
    } as IDeck,
    crossfadeValue: 0.5, // 0: Deck 1, 1: Deck 2, 0.5: Center
})

const unsub = devtools(consoleState, { name: 'console state', enabled: true })
