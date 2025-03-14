/**
 * Custom fetch wrapper with default headers with token and error handling
 * @param url - API endpoint URL
 * @returns Promise with parsed JSON response
 */

import { handleClientError } from '@/lib/client/utils/handleClientError'

export const customFetcher = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('guestToken')

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
