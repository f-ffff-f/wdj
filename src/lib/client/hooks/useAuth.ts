import { Role } from '@prisma/client'
import { signIn as signInNextAuth, signOut as signOutNextAuth, useSession } from 'next-auth/react'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for signin, signout, and checking authentication status
 * Uses React Query mutations for better state management and error handling
 */
export const useAuth = () => {
    const router = useRouter()
    const { data: session } = useSession()

    const isMember = session?.user?.role === Role.MEMBER
    const isGuest = session?.user?.role === Role.GUEST

    /**
     * React Query mutation for signing in with credentials
     */
    const signInMutation = useMutation({
        mutationFn: async (data: z.infer<typeof SigninSchema>) => {
            const result = await signInNextAuth('credentials', {
                ...data,
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        },
        onSuccess: () => {
            router.push('/main')
        },
        onError: (error) => {
            console.error('Signin error:', error)
            alert(error)
        },
    })

    /**
     * React Query mutation for signing out current user
     */
    const signOutMutation = useMutation({
        mutationFn: async () => {
            await signOutNextAuth({ redirect: false })
        },
        onSuccess: () => {
            router.refresh()
        },
        onError: (error) => {
            console.error('Logout error:', error)
        },
    })

    return {
        signInMutation,
        signOutMutation,
        session,
        isMember,
        isGuest,
    }
}
