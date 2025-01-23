import { ITrack } from '@/app/_lib/types'
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IState {
    vault: {
        UI: {
            focusedId: string
        }
        library: ITrack[]
    }
}

export const state = proxy<IState>({
    vault: { UI: { focusedId: '' }, library: [] },
})

const unsub = devtools(state, { name: 'state', enabled: true })
