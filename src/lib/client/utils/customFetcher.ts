/**
 * Custom fetch wrapper with default headers and error handling
 * Automatically includes cookies for authentication
 * @param url - API endpoint URL
 * @returns Promise with parsed JSON response
 */

import { handleClientError } from '@/lib/client/utils/handleClientError'

export const customFetcher = async (url: string, options: RequestInit = {}) => {
    // 기본 헤더 설정
    const defaultHeaders = {
        'Content-Type': 'application/json',
    }

    const headers = {
        ...defaultHeaders,
        ...options.headers,
    }

    // credentials: 'include' 추가하여 쿠키를 요청에 포함
    const res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // 쿠키 기반 인증을 위해 필수
    })

    if (!res.ok) {
        await handleClientError(res)
    }

    return res.json()
}
