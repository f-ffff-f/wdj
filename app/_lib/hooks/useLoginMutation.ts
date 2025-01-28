import { useMutation, useQueryClient } from '@tanstack/react-query'

type LoginArgs = {
    email: string
    password: string
}

type LoginResponse = {
    createdAt: string
    email: string
    id: string
    message: string
    token: string
}

const loginRequest = async ({ email, password }: LoginArgs): Promise<LoginResponse> => {
    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData?.error || 'Login failed')
    }

    return res.json() as Promise<LoginResponse>
}

export const useLoginMutation = (onSuccess?: (data: LoginResponse) => void) => {
    const queryClient = useQueryClient()

    return useMutation<LoginResponse, Error, LoginArgs>({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            localStorage.setItem('token', data.token)
            queryClient.invalidateQueries({
                queryKey: ['/api/user/me'],
                refetchType: 'active',
            })
            if (onSuccess) onSuccess(data)
        },
        onError: (error) => {
            console.error('Login error:', error)
        },
    })
}
