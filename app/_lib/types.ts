import { DECK_IDS } from '@/app/_lib/constants'
import { snapshot } from 'valtio'

export type TDeckIds = typeof DECK_IDS
export interface IStore {
    vault: {
        library: ITrack[]
    }
    controller: {
        decks: Record<TDeckIds[number], IDeck>
        crossfade: { value: number }
    }
}

// Valtio snapshot type
export type TSnapshot = ReturnType<typeof snapshot<IStore>>

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
