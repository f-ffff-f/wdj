import { Role } from '@prisma/client'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoginSchema } from '@/lib/shared/validations/userSchemas'
import { z } from 'zod'
/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for login, logout, and checking authentication status
 */
export const useAuth = () => {
    const { data: session, status } = useSession()
    const router = useRouter()

    const isLoading = status === 'loading'
    const isAuthenticated = status === 'authenticated'
    const isMember = session?.user?.role === Role.MEMBER
    const isGuest = session?.user?.role === Role.GUEST

    /**
     * Login with credentials
     */
    const login = async (data: z.infer<typeof LoginSchema>) => {
        try {
            const result = await signIn('credentials', {
                ...data,
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    /**
     * Create and login as guest user
     */
    const loginAsGuest = async () => {
        try {
            const result = await signIn('credentials', {
                email: '',
                password: '',
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        } catch (error) {
            console.error('Guest login error:', error)
            throw error
        }
    }

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            await signOut({ redirect: false })
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
        login,
        loginAsGuest,
        logout,
    }
}
