import { useQuery } from '@tanstack/react-query'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { User } from '@prisma/client'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
/**
 * 현재 인증된 사용자의 정보를 관리하는 커스텀 훅
 */

export const useCurrentUser = () => {
    const { data, isLoading, error } = useQuery<User>({
        queryKey: ['/api/user/me'],
        queryFn: async () => {
            try {
                return await customFetcher('/api/user/me')
            } catch (error) {
                // 토큰 없거나 토큰 만료 시 초기화 하고 새로운 게스트 생성
                if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
                    localStorage.removeItem('token')
                    sessionStorage.removeItem('guestToken')

                    const guestResponse = await customFetcher('/api/guest/create', {
                        method: 'POST',
                    })

                    const token = guestResponse.token
                    sessionStorage.setItem('guestToken', token)
                    return customFetcher('/api/user/me') // 재시도
                } else {
                    throw error // 다른 에러는 상위로 전파
                }
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
