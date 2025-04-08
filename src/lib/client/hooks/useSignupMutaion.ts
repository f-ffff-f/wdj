import { OmitPasswordUser, signUp } from '@/app/(auth)/_actions/signUp'
import { useMutation } from '@tanstack/react-query'

type SignupRequest = {
    email: string
    password: string
}

export const useSignupMutation = (handleSuccess?: (data: OmitPasswordUser) => void) => {
    return useMutation({
        mutationFn: async ({ email, password }: SignupRequest) => {
            return signUp({ email, password })
        },
        onSuccess: (data) => {
            if (handleSuccess) handleSuccess(data)
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}
