import { TDeckIds } from '@/app/_lib/constants'

export interface IStore {
    vault: {
        library: ITrack[]
    }
    decks: Record<TDeckIds[number], IDeck>
    crossfade: { value: number }
}

// ------------------------------

export interface ITrack {
    id: string
    fileName: string
    duration: number
    url: string
}

export interface IDeck {
    currentTrack: ITrack | null
    playPosition: number
    volume: number
    isPlaying: boolean
}
