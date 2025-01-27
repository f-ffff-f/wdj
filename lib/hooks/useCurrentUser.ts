import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '@/lib/fetcher'

/**
 * 현재 인증된 사용자의 정보를 관리하는 커스텀 훅
 * @returns {Object} 사용자 정보와 로딩, 에러 상태, 로그아웃 함수를 포함한 객체
 */
interface User {
    id: string
    email: string
    createdAt: string
}

export const useCurrentUser = () => {
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: () => fetcher('/api/user/me'),
        retry: false,
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: true,
    })

    // 로그아웃 함수
    const logout = () => {
        // localStorage에서 토큰 제거
        localStorage.removeItem('token')
        // React Query 캐시 초기화
        queryClient.setQueryData(['currentUser'], null)
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    }

    return {
        data,
        isLoading,
        error,
        isAuthenticated: !!data,
        logout,
    }
}

export type { User }
