import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication middleware using Auth.js v5
 * 1. Get session using Auth.js auth() function
 * 2. Verify authentication status
 * 3. Allow access or redirect based on authentication status
 */

// Routes that should be protected
const PROTECTED_API_PATH = ['/api/tracks', '/api/playlist', '/api/upload']
// Pages that require authentication
const PROTECTED_PAGES = ['/main', '/dashboard', '/profile', '/settings']

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Check if the current path is a protected API route
    const isProtectedApi = PROTECTED_API_PATH.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    // Check if the current path is a protected page
    const isProtectedPage = PROTECTED_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    // If not a protected route, continue
    if (!isProtectedApi && !isProtectedPage) {
        return NextResponse.next()
    }

    // If accessing a protected route without a session
    if (!session) {
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
    }

    // User is authenticated, add userId to headers for API routes
    if (isProtectedApi && session?.user?.id) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', session.user.id)

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    }

    // For authenticated page access, just continue
    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*', '/main/:path*', '/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
}
