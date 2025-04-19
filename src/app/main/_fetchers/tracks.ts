import { getBaseUrl } from '@/lib/client/utils'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import type { AppResponse } from '@/lib/shared/types'
import { Track } from '@prisma/client'

export const fetchTracks = async (playlistId: string | typeof PLAYLIST_DEFAULT_ID): Promise<Track[]> => {
    const response = await fetch(`/api/playlists/${playlistId}/tracks`)

    if (!response.ok) {
        // 네트워크 레벨 에러
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: AppResponse<Track[]> = await response.json()

    if (!result.success) {
        // 서버가 success: false 와 함께 에러 메시지를 반환한 경우
        throw new Error(result.error || 'Failed to fetch tracks')
    }

    // 성공 시 데이터 반환
    return result.data || []
}
