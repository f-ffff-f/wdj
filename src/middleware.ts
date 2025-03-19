import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Authentication middleware using NextAuth
 * 1. Extract JWT token from request
 * 2. Verify token
 * 3. Allow access or redirect based on authentication status
 */

// Routes that don't require authentication
const PUBLIC_PATHS = ['/', '/signup', '/api/auth']

// Routes that should be protected
const PROTECTED_PATHS = ['/api/tracks', '/api/playlist', '/api/upload']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if path needs to be protected
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    const needsProtection = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    if (!needsProtection || isPublicPath) {
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

            // For other protected routes, redirect to home
            return NextResponse.redirect(new URL('/', request.url))
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

        // Handle authentication errors
        if (pathname.startsWith('/api/')) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: 'Authentication error',
                }),
                {
                    status: 401,
                    headers: { 'content-type': 'application/json' },
                },
            )
        }

        return NextResponse.redirect(new URL('/', request.url))
    }
}

export const config = {
    matcher: ['/api/:path*'],
}
