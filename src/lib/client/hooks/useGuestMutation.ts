import { useAuth } from '@/lib/client/hooks/useAuth'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { CreateGuestSchema } from '@/lib/shared/validations/userSchemas'
import { User } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

export const useGuestMutation = () => {
    const { signInMutation } = useAuth()

    const createGuestAndSignInMutation = useMutation<User, Error, z.infer<typeof CreateGuestSchema>>({
        mutationFn: async ({ token }) => {
            // this API internally verifies the turnstile token
            return customFetcher('/api/user/guest/create', {
                method: 'POST',
                body: JSON.stringify({ token }),
            })
        },
        onSuccess: async (data) => {
            try {
                // Automatically sign in as the guest user after creation
                await signInMutation.mutateAsync({
                    guestUserId: data.id,
                })
            } catch (error) {
                console.error('Guest signin error after creation:', error)
                throw error
            }
        },
        onError: (error) => {
            console.error('Guest creation error:', error)
            alert(error)
        },
    })

    return { createGuestAndSignInMutation }
}
