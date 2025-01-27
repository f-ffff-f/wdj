export const fetcher = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token') // 토큰을 LocalStorage에서 가져옴
    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // 토큰이 있다면 헤더 추가
    }

    const res = await fetch(url, { ...options, headers })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || `HTTP error: ${res.status}`)
    }

    return res.json() // 성공 응답 반환
}
