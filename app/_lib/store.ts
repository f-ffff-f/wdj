// 아 잘 안되네
import { ITrack } from '@/app/_lib/types'
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface IStore {
    vault: {
        library: ITrack[]
    }
}

export const store = proxy<IStore>({
    vault: { library: [] },
})

const unsub = devtools(store, { name: 'store', enabled: true })
