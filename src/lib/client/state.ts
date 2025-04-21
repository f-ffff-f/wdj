import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IState {
    UI: {
        focusedTrackId: string | null
        storageEstimate: StorageEstimate | null
    }
}

export const state = proxy<IState>({
    UI: { focusedTrackId: null, storageEstimate: null },
})

devtools(state, { name: 'state', enabled: true })

export const updateStorageEstimate = async () => {
    if (navigator?.storage?.estimate) {
        try {
            const estimate = await navigator.storage.estimate()
            state.UI.storageEstimate = estimate
        } catch (error) {
            console.error('Failed to estimate storage:', error)
            state.UI.storageEstimate = null
        }
    }
}
