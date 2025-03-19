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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const needsProtection = PROTECTED_API_PATH.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    if (!needsProtection) {
        return NextResponse.next()
    }

    try {
        // Get the token using NextAuth's getToken helper
        const token = await getToken({
            req: request,
            secret: process.env.JWT_SECRET,
        })

        if (!token) {
            // For API routes, return 401 Unauthorized
            if (pathname.startsWith('/api/')) {
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
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        // User is authenticated, add userId to headers
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', token.userId as string)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.error('Middleware error:', error)
        return handleServerError(error)
    }
}

export const config = {
    matcher: ['/api/:path*'],
}
