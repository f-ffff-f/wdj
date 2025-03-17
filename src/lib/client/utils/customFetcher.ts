/**
 * Custom fetch wrapper with default headers with token and error handling
 * @param url - API endpoint URL
 * @returns Promise with parsed JSON response
 */

import { handleClientError } from '@/lib/client/utils/handleClientError'
import { getToken } from '@/lib/client/utils/tokenStorage'

export const customFetcher = async (url: string, options: RequestInit = {}) => {
    // 토큰 가져오기
    const token = getToken()

    // 기본 헤더 설정
    const defaultHeaders = {
        'Content-Type': 'application/json',
    }

    const headers = {
        ...defaultHeaders,
        ...options.headers,
        Authorization: `Bearer ${token}`,
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
        await handleClientError(res)
    }

    return res.json()
}
