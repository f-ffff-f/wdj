import { customFetcher } from '@/lib/client/utils/customFetcher'
import { User } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type TRequest = { email: string; password: string }
type TResponse = User

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
            // 관련 쿼리 무효화 (재요청)
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
