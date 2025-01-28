import { UserMeAPI } from '@/app/types/api'
import { useQuery } from '@tanstack/react-query'
import { fetcher } from '@/app/_lib/queryClient/fetcher'
/**
 * 현재 인증된 사용자의 정보를 관리하는 커스텀 훅
 */

export const useCurrentUser = () => {
    const { data, isLoading, error } = useQuery<UserMeAPI['Response']>({
        queryKey: ['/api/user/me'],
        queryFn: () => fetcher('/api/user/me'),
        retry: false,
        staleTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: true,
    })

    // 로그아웃 함수
    return {
        data,
        isLoading,
        error,
        isAuthenticated: !!data,
    }
}
