import { Role } from '@prisma/client'
import { useSession } from 'next-auth/react'
/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for signin, signout, and checking authentication status
 * Uses React Query mutations for better state management and error handling
 */
export const useClientAuth = () => {
    const { data: session } = useSession()

    const isMember = session?.user?.role === Role.MEMBER
    const isGuest = session?.user?.role === Role.GUEST

    return {
        session,
        isMember,
        isGuest,
    }
}
