import { Role } from '@prisma/client'
import { signIn as signInNextAuth, signOut as signOutNextAuth, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { z } from 'zod'
/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for signin, signout, and checking authentication status
 */
export const useAuth = () => {
    const { data: session, status } = useSession()
    const router = useRouter()

    const isLoading = status === 'loading'
    const isAuthenticated = status === 'authenticated'
    const isMember = session?.user?.role === Role.MEMBER
    const isGuest = session?.user?.role === Role.GUEST

    /**
     * Sign In with credentials
     */
    const signIn = async (data: z.infer<typeof SigninSchema>) => {
        try {
            const result = await signInNextAuth('credentials', {
                ...data,
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        } catch (error) {
            console.error('Signin error:', error)
            throw error
        }
    }

    /**
     * Create and Sign In as guest user
     */
    const signInAsGuest = async () => {
        try {
            const result = await signInNextAuth('credentials', {
                email: '',
                password: '',
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        } catch (error) {
            console.error('Guest signin error:', error)
            throw error
        }
    }

    /**
     * Sign Out current user
     */
    const signOut = async () => {
        try {
            await signOutNextAuth({ redirect: false })
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }

    return {
        session,
        user: session?.user,
        isLoading,
        isAuthenticated,
        isMember,
        isGuest,
        signIn,
        signInAsGuest,
        signOut,
    }
}
