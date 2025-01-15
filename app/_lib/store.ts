import { ITrack } from '@/app/_lib/types'
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IStore {
    vault: {
        UI: {
            focusedId: string
        }
        library: ITrack[]
    }
}

export const store = proxy<IStore>({
    vault: { UI: { focusedId: '' }, library: [] },
})

const unsub = devtools(store, { name: 'store', enabled: true })
