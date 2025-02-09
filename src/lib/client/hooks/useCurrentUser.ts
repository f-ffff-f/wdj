import { useQuery } from '@tanstack/react-query'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { User } from '@prisma/client'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
import { handleClientError } from '@/lib/client/utils/handleClientError'
/**
 * 현재 인증된 사용자의 정보를 관리하는 커스텀 훅
 */

// app/_lib/frontend/hooks/useCurrentUser.ts
export const useCurrentUser = () => {
    const { data, isLoading, error } = useQuery<User>({
        queryKey: ['/api/user/me'],
        queryFn: async () => {
            try {
                return await customFetcher('/api/user/me')
            } catch (error) {
                if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
                    localStorage.removeItem('token')
                    sessionStorage.removeItem('guestToken')

                    const guestRes = await fetch('/api/guest/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    })

                    if (!guestRes.ok) {
                        await handleClientError(guestRes)
                    }

                    const { token } = await guestRes.json()
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
