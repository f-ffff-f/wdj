'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

/**
 * Session provider that wraps the application to provide Auth.js v5 session context
 */
export const SessionProvider = ({ children }: { children: ReactNode }) => {
    return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
