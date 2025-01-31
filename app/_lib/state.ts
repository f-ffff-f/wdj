import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IState {
    UI: {
        currentPlaylistId: string
        focusedTrackId: string
    }
}

export const state = proxy<IState>({
    UI: { currentPlaylistId: '', focusedTrackId: '' },
})

const unsub = devtools(state, { name: 'state', enabled: true })
