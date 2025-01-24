import { generateId } from '@/app/_lib/state/utils'

export enum EDeckIds {
    DECK_1 = 1,
    DECK_2 = 2,
}

export const defaultPlaylistName = 'library'
export const defaultPlaylistId = generateId(defaultPlaylistName)
