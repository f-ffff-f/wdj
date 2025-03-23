import { auth } from '@/auth'
import { handleServerError } from '@/lib/server/handleServerError'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // If accessing a protected route without a session
    if (!session) {
        //////////////////////////////////////////////
        if (pathname.startsWith('/api/')) {
            // For API routes, return 401 Unauthorized with JSON response
            return handleServerError(new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED), {
                userId: undefined,
                action: 'middleware',
            })
        }
        //////////////////////////////////////////////
        else if (!pathname.startsWith('/api/')) {
            // For page routes, redirect to login page
            return NextResponse.redirect(new URL('/', request.url))
        }
        //////////////////////////////////////////////
    } else {
        // accessing a protected route with a session
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        // api
        '/api/tracks/:path*',
        '/api/playlist/:path*',
        '/api/upload/:path*',

        // pages
        '/main/:path*',
    ],
}
