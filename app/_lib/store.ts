// 아 잘 안되네
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'
import { IStore } from '@/app/_lib/types'
import { MediaElementAudioManager } from '@/app/_lib/AudioManager/MediaElementAudioManager'

const audioManager = new MediaElementAudioManager()
const deckA = audioManager.addDeck()
const deckB = audioManager.addDeck()

export const store = proxy<IStore>({
    vault: { library: [] },
    UI: {
        decks: [
            {
                id: deckA.id,
                name: 'Deck A',
                volume: 1,
                currentTime: 0,
                duration: 0,
                isPlaying: false,
                currentTrack: null,
            },
            {
                id: deckB.id,
                name: 'Deck B',
                volume: 1,
                currentTime: 0,
                duration: 0,
                isPlaying: false,
                currentTrack: null,
            },
        ],
        crossfade: { value: 0.5 },
    },
})

const unsub = devtools(store, { name: 'store', enabled: true })
