import { Role } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'
import { useSnapshot } from 'valtio'
import { state } from '@/lib/client/state'
/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for signin, signout, and checking authentication status
 * Uses React Query mutations for better state management and error handling
 */
export const useClientAuth = () => {
    const currentPlaylistId = useSnapshot(state).UI.currentPlaylistId

    const queryClient = useQueryClient()

    const router = useRouter()
    const { data: session, update: updateSession } = useSession()

    const isMember = session?.user?.role === Role.MEMBER
    const isGuest = session?.user?.role === Role.GUEST

    /**
     * React Query mutation for signing in with credentials
     * @deprecated
     */
    const signInMutation = useMutation({
        mutationFn: async (data: z.infer<typeof SigninSchema>) => {
            const result = await nextAuthSignIn('credentials', {
                ...data,
                redirect: false,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            return result
        },
        onSuccess: () => {
            router.refresh()
        },
        onError: (error) => {
            console.error('Signin error:', error)
            alert(error)
        },
    })

    /**
     * React Query mutation for signing out current user
     * @deprecated
     */
    const signOutMutation = useMutation({
        mutationFn: async () => {
            await nextAuthSignOut({ redirect: false })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', currentPlaylistId] })
            router.refresh()
        },
        onError: (error) => {
            console.error('Logout error:', error)
        },
    })

    /**
     * Manually refresh the session data
     * Used after server-side auth operations to ensure client state is up-to-date
     */
    const refreshSession = async () => {
        await updateSession()
        router.refresh()
    }

    return {
        signInMutation,
        signOutMutation,
        session,
        isMember,
        isGuest,
        refreshSession,
    }
}
