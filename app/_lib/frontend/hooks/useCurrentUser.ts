import { UserMeAPI } from '@/app/_lib/types/api'
import { useQuery } from '@tanstack/react-query'
import { fetchWithToken } from '@/app/_lib/frontend/auth/fetchWithToken'
/**
 * 현재 인증된 사용자의 정보를 관리하는 커스텀 훅
 */

export const useCurrentUser = () => {
    const { data, isLoading, error } = useQuery<UserMeAPI['Response']>({
        queryKey: ['/api/user/me'],
        queryFn: async () => {
            try {
                return await fetchWithToken('/api/user/me')
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'

                if (
                    errorMessage.includes('Token is not exist') ||
                    errorMessage.includes('Invalid token') ||
                    errorMessage.includes('User not found')
                ) {
                    const guestRes = await fetch('/api/guest/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })

                    if (!guestRes.ok) {
                        throw new Error('Guest creation failed')
                    }

                    const { token } = await guestRes.json()
                    sessionStorage.setItem('guestToken', token)
                    return fetchWithToken('/api/user/me') // 재시도
                }
                throw error // 다른 에러는 상위로 전파
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: true,
    })

    return {
        data,
        isLoading,
        error,
        isMember: data?.role === 'MEMBER',
    }
}
