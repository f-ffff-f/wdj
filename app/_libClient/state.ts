import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IState {
    UI: {
        currentPlaylistId: string
        focusedTrackId: string
        storageEstimate: StorageEstimate | null
    }
}

export const state = proxy<IState>({
    UI: { currentPlaylistId: '', focusedTrackId: '', storageEstimate: null },
})

export const updateStorageEstimate = async () => {
    if (navigator?.storage && navigator?.storage?.estimate) {
        const estimate = await navigator.storage.estimate()
        state.UI.storageEstimate = estimate
    }
}

const unsub = devtools(state, { name: 'state', enabled: true })
