import { DECK_IDS } from '@/lib/client/constants'

export type TDeckId = (typeof DECK_IDS)[keyof typeof DECK_IDS]
