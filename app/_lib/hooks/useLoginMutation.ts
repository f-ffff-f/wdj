import { UserLoginAPI } from '@/app/_lib/types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const loginRequest = async ({ email, password }: UserLoginAPI['Request']): Promise<UserLoginAPI['Response']> => {
    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Login failed')
    }

    return res.json() as Promise<UserLoginAPI['Response']>
}

export const useLoginMutation = (onSuccess?: (data: UserLoginAPI['Response']) => void) => {
    const queryClient = useQueryClient()

    return useMutation<UserLoginAPI['Response'], Error, UserLoginAPI['Request']>({
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
