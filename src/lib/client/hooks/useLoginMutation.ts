import { customFetcher } from '@/lib/client/utils/customFetcher'
import { setToken } from '@/lib/client/utils/tokenStorage'
import { User } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type TRequest = { email: string; password: string }
type TResponse = User & { token: string }

export const useLoginMutation = (onSuccess?: (data: TResponse) => void) => {
    const queryClient = useQueryClient()

    return useMutation<TResponse, Error, TRequest>({
        mutationFn: async ({ email, password }: TRequest) => {
            return customFetcher('/api/user/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })
        },
        onSuccess: (data) => {
            // 멤버 토큰 저장 (게스트 토큰은 자동으로 제거됨)
            setToken(data.token, 'member')

            queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist/[id]/tracks'] })
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] })

            if (onSuccess) onSuccess(data)
        },
        onError: (error) => {
            alert(error)
        },
    })
}
