import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import type { AppResponse } from '@/lib/shared/types'
import { Track } from '@prisma/client'

export const fetchTracks = async (playlistId: string | typeof PLAYLIST_DEFAULT_ID): Promise<Track[]> => {
    const response = await fetch(`/api/playlists/${playlistId}/tracks`)

    const result: AppResponse<Track[]> = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tracks')
    }

    return result.data || []
}
