import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { UnauthorizedError } from '@/app/_libServer/CustomErrors'
import { handleServerError } from '@/app/_libServer/handleServerError'

/**
 * 인증 미들웨어
 * 1. 토큰 검증
 * 2. 토큰 디코딩
 * 3. 토큰 검증 실패 시 UnauthorizedError 401 에러 반환
 */

const AUTH_BYPASS_PATHS = ['/api/user/create', '/api/user/login', '/api/guest/create']

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        return payload
    } catch (error) {
        throw new UnauthorizedError('Invalid token')
    }
}

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api')) {
        if (AUTH_BYPASS_PATHS.includes(request.nextUrl.pathname)) {
            return NextResponse.next()
        }

        try {
            const authHeader = request.headers.get('Authorization')

            if (!authHeader) {
                throw new UnauthorizedError('No Authorization header provided')
            }

            const token = authHeader.split(' ')[1]

            if (!token) {
                throw new UnauthorizedError('Token is not exist')
            }

            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined')
            }

            const decoded = await verifyJWT(token)

            const requestHeaders = new Headers(request.headers)
            requestHeaders.set('x-user-id', decoded.userId as string)

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

    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*'],
}
