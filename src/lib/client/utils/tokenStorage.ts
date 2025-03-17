/**
 * Token storage utility for centralized token management
 * Handles member tokens (localStorage) and guest tokens (sessionStorage)
 */

// Storage keys
const MEMBER_TOKEN_KEY = 'token'
const GUEST_TOKEN_KEY = 'guestToken'

// Token type
export type TokenType = 'member' | 'guest'

/**
 * Get the active token (member token takes precedence over guest token)
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null

    return getMemberToken() || getGuestToken()
}

/**
 * Get member token from localStorage
 */
export const getMemberToken = (): string | null => {
    if (typeof window === 'undefined') return null

    return localStorage.getItem(MEMBER_TOKEN_KEY)
}

/**
 * Get guest token from sessionStorage
 */
export const getGuestToken = (): string | null => {
    if (typeof window === 'undefined') return null

    return sessionStorage.getItem(GUEST_TOKEN_KEY)
}

/**
 * Set token based on type
 */
export const setToken = (token: string, type: TokenType): void => {
    if (typeof window === 'undefined') return

    if (type === 'member') {
        localStorage.setItem(MEMBER_TOKEN_KEY, token)
        // When setting a member token, remove any guest token
        sessionStorage.removeItem(GUEST_TOKEN_KEY)
    } else {
        sessionStorage.setItem(GUEST_TOKEN_KEY, token)
    }
}

/**
 * Remove a specific token type
 */
export const removeToken = (type: TokenType): void => {
    if (typeof window === 'undefined') return

    if (type === 'member') {
        localStorage.removeItem(MEMBER_TOKEN_KEY)
    } else {
        sessionStorage.removeItem(GUEST_TOKEN_KEY)
    }
}

/**
 * Clear all tokens (both member and guest)
 */
export const clearAllTokens = (): void => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(MEMBER_TOKEN_KEY)
    sessionStorage.removeItem(GUEST_TOKEN_KEY)
}

/**
 * Check if user is authenticated as a member
 */
export const isMemberAuthenticated = (): boolean => {
    return !!getMemberToken()
}

/**
 * Check if user is authenticated as a guest
 */
export const isGuestAuthenticated = (): boolean => {
    return !!getGuestToken() && !isMemberAuthenticated()
}

/**
 * Check if user has any authentication
 */
export const isAuthenticated = (): boolean => {
    return !!getToken()
}
