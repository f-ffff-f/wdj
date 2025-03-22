import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { handleServerError } from '@/lib/server/handleServerError'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'

/**
 * Authentication middleware using NextAuth
 * 1. Extract JWT token from request
 * 2. Verify token
 * 3. Allow access or redirect based on authentication status
 */

// Routes that should be protected
const PROTECTED_API_PATH = ['/api/tracks', '/api/playlist', '/api/upload']
// Pages that require authentication
const PROTECTED_PAGES = ['/main']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the current path is a protected API route
    const isProtectedApi = PROTECTED_API_PATH.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    // Check if the current path is a protected page
    const isProtectedPage = PROTECTED_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    // If not a protected route, continue
    if (!isProtectedApi && !isProtectedPage) {
        return NextResponse.next()
    }

    try {
        // Get the token using NextAuth's getToken helper
        const token = await getToken({
            req: request,
            secret: process.env.JWT_SECRET,
        })

        // Handle unauthenticated requests
        if (!token) {
            // For API routes, return 401 Unauthorized
            if (isProtectedApi) {
                return new NextResponse(
                    JSON.stringify({
                        success: false,
                        message: 'Authentication required',
                    }),
                    {
                        status: 401,
                        headers: { 'content-type': 'application/json' },
                    },
                )
            }

            // For protected pages, redirect to login page
            if (isProtectedPage) {
                const url = new URL('/', request.url)
                return NextResponse.redirect(url)
            }

            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        // User is authenticated, add userId to headers for API routes
        if (isProtectedApi) {
            if (!token.userId) {
                throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
            }

            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('x-user-id', token.userId)

            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
        }

        // For authenticated page access, just continue
        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        return handleServerError(error)
    }
}

export const config = {
    matcher: ['/api/:path*', '/main/:path*'],
}
