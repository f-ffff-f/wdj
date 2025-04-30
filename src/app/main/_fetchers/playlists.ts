import type { AppResponse } from '@/lib/shared/types'
import { Playlist } from '@prisma/client'

export const fetchPlaylists = async (): Promise<Playlist[]> => {
    const response = await fetch(`/api/playlists`)

    const result: AppResponse<Playlist[]> = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch playlists')
    }

    return result.data || []
}
