/**
 * Custom fetch wrapper with default headers and error handling
 * @param url - API endpoint URL
 * @returns Promise with parsed JSON response
 */

export const fetcher = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('guestToken')

    // 기본 헤더 설정
    const defaultHeaders = {
        'Content-Type': 'application/json',
    }

    // skipContentType이 true가 아닐 경우에만 Content-Type 헤더 포함
    const headers = {
        ...defaultHeaders,
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || `HTTP error: ${res.status}`)
    }

    return res.json()
}
