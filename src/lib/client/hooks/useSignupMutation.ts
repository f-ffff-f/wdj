import { customFetcher } from '@/lib/client/utils/customFetcher'
import { User } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type SignupRequest = {
    email: string
    password: string
}

type SignupResponse = User

export const useSignupMutation = (onSuccess?: (data: SignupResponse) => void) => {
    const queryClient = useQueryClient()

    return useMutation<SignupResponse, Error, SignupRequest>({
        mutationFn: async ({ email, password }: SignupRequest) => {
            return customFetcher('/api/user/create', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })

            if (onSuccess) onSuccess(data)
        },
    })
}
