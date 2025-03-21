import { customFetcher } from '@/lib/client/utils/customFetcher'
import { User } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'

type SignupRequest = {
    email: string
    password: string
}

export const useSignupMutation = (handleSuccess?: (data: User) => void) => {
    return useMutation<User, Error, SignupRequest>({
        mutationFn: async ({ email, password }: SignupRequest) => {
            return customFetcher('/api/user/member/create', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })
        },
        onSuccess: (data) => {
            if (handleSuccess) handleSuccess(data)
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}
