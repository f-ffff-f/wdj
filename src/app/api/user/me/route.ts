import { prisma } from '@/lib/prisma'
import { handleServerError } from '@/lib/server/handleServerError'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

/**
 * 인증된 사용자의 정보를 반환하는 API 엔드포인트
 * Authorization 헤더에서 JWT 토큰을 검증하고 해당 사용자 정보를 반환
 */

// app/api/user/me/route.ts
export async function GET(): Promise<NextResponse> {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)
        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // 디코딩된 userId로 사용자 정보 조회
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                role: true,
            },
        })

        if (!user) {
            throw new NotFoundError('User not found')
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('User info search error:', error)
        return handleServerError(error)
    }
}
