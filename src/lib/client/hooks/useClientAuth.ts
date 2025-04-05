import { Role } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
/**
 * Custom authentication hook that wraps NextAuth's useSession
 * Provides convenient methods for signin, signout, and checking authentication status
 */
export const useClientAuth = () => {
    const { data: session, update } = useSession()

    const { data: isMember } = useQuery({
        queryKey: ['auth', 'isMember', session?.user?.id],
        queryFn: async () => {
            await update()
            return session?.user?.role === Role.MEMBER
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
    })

    return {
        session,
        isMember,
    }
}
