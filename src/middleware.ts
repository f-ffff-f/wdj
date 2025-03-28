import { auth } from '@/auth'
import { handleServerError } from '@/lib/server/handleServerError'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    if (!session) {
        if (pathname.startsWith('/api/')) {
            // For API routes, return 401 Unauthorized with JSON response
            return handleServerError(new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED), {
                userId: undefined,
                action: 'middleware',
            })
        }
    } else {
        // accessing a protected route with a session
        return NextResponse.next()
    }
}

export const config = {
    matcher: ['/api/tracks/:path*', '/api/playlist/:path*', '/api/upload/:path*'],
}
