'use client'

import { Session } from 'next-auth'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode, useMemo } from 'react'

/**
 * Session provider that wraps the application to provide Auth.js v5 session context
 */
export const SessionProvider = ({
    children,
    session,
    sessionKey,
}: {
    children: ReactNode
    session: Session | null
    sessionKey: number
}) => {
    const memoizedSessionKey = useMemo(() => {
        console.log('session changed >>> ', session)

        return sessionKey
    }, [session, sessionKey])

    return (
        // !!!!!!!!!due to auth.js issue, need to give prop session, key to the provider for updating client session
        <NextAuthSessionProvider session={session} key={memoizedSessionKey}>
            {children}
        </NextAuthSessionProvider>
    )
}
