import { proxy } from 'valtio'
import { TDeckIds, AUDIO_DEFAULTS, CROSSFADER_CONFIG } from '@/app/_lib/constants'
import { devtools } from 'valtio/utils'

interface ITrackInfo {
    id: string
    title: string
    artist: string
    duration: number
    url: string
}

export interface IDeckState {
    currentTrack: ITrackInfo | null
    playPosition: number
    volume: number
    isPlaying: boolean
}

export interface ControlState {
    decks: Record<TDeckIds[number], IDeckState>
    crossfadeValue: number
    library: ITrackInfo[]
}

export const controlState = proxy<ControlState>({
    decks: {
        a: { ...AUDIO_DEFAULTS },
        b: { ...AUDIO_DEFAULTS },
    },
    crossfadeValue: CROSSFADER_CONFIG.DEFAULT,
    library: [],
})

const unsub = devtools(controlState, { name: 'control state', enabled: true })
