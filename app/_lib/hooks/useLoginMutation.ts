import { User } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type TRequest = { email: string; password: string }
type TResponse = User & { token: string }

const loginRequest = async ({ email, password }: TRequest) => {
    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Login failed')
    }

    return res.json()
}

export const useLoginMutation = (onSuccess?: (data: TResponse) => void) => {
    const queryClient = useQueryClient()

    return useMutation<TResponse, Error, TRequest>({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            localStorage.setItem('token', data.token)
            queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist/[id]/tracks'] })
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] })

            if (onSuccess) onSuccess(data)
        },
        onError: (error) => {
            console.error('Login error:', error)
        },
    })
}
