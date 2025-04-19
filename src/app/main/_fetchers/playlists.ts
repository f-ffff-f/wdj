import { getBaseUrl } from '@/lib/client/utils'
import type { AppResponse } from '@/lib/shared/types'
import { Playlist } from '@prisma/client'

export const fetchPlaylists = async (): Promise<Playlist[]> => {
    const response = await fetch(`/api/playlists`)

    if (!response.ok) {
        // 네트워크 레벨 에러 (5xx, 4xx 등)
        // 필요시 response.status 등을 확인하여 더 구체적인 에러 throw 가능
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: AppResponse<Playlist[]> = await response.json()

    if (!result.success) {
        // 서버가 success: false 와 함께 에러 메시지를 반환한 경우
        throw new Error(result.error || 'Failed to fetch playlists')
    }

    // 성공 시 데이터 반환 (타입 단언 또는 타입 가드 사용 가능)
    return result.data || []
}
