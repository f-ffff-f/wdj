import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IuiState {
    UI: {
        focusedTrackId: string | null
    }
    storageEstimate: StorageEstimate | null
}

export const uiState = proxy<IuiState>({
    UI: { focusedTrackId: null },
    storageEstimate: null,
})

devtools(uiState, { name: 'uiState', enabled: true })

export const updateStorageEstimate = async () => {
    if (navigator?.storage?.estimate) {
        try {
            const estimate = await navigator.storage.estimate()
            uiState.storageEstimate = estimate
        } catch (error) {
            console.error('Failed to estimate storage:', error)
            uiState.storageEstimate = null
        }
    }
}
