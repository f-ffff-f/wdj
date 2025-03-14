import { handleClientError } from '@/lib/client/utils/handleClientError'
import { User } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type TRequest = { email: string; password: string }
type TResponse = User & { token: string }

export const useLoginMutation = (onSuccess?: (data: TResponse) => void) => {
    const queryClient = useQueryClient()

    return useMutation<TResponse, Error, TRequest>({
        mutationFn: async ({ email, password }: TRequest) => {
            const res = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                await handleClientError(res)
            }

            return res.json()
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.token)
            sessionStorage.removeItem('guestToken')

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
