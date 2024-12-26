import { proxy } from 'valtio'
import { DECK_CONFIG, CROSSFADE_NODE_DEFAULT } from '@/app/_lib/constants'
import { devtools } from 'valtio/utils'
import { IStore } from '@/app/_lib/types'

export const store = proxy<IStore>({
    vault: { library: [] },
    decks: {
        a: { ...DECK_CONFIG },
        b: { ...DECK_CONFIG },
    },
    crossfade: {
        value:CROSSFADE_NODE_DEFAULT},
})

const unsub = devtools(store, { name: 'control state', enabled: true })
