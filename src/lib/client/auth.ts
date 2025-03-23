'use client'

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, SignInOptions, SignOutParams } from 'next-auth/react'

/**
 * Client-side wrapper for Auth.js v5 signIn
 */
export const signIn = async (provider: string, options?: SignInOptions) => {
    return nextAuthSignIn(provider, options)
}

/**
 * Client-side wrapper for Auth.js v5 signOut
 * @param options Object with redirect flag
 */
export const signOut = async (options?: { redirect?: boolean; callbackUrl?: string }) => {
    return nextAuthSignOut(options as SignOutParams)
}
