export interface IStore {
    vault: {
        library: ITrack[]
    }
    UI: {
        decks: IDeckUI[]
    }
}

export interface ITrack {
    id: string
    fileName: string
    duration: number
    url: string
}

export interface IDeckUI {
    id: number
    name: string
    volume: number
    currentTime: number
    duration: number
    isPlaying: boolean
    currentTrack: ITrack | null
}
