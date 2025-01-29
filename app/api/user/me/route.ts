import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { tryGetUserIdFromToken } from '@/app/_lib/utils'

/**
 * 인증된 사용자의 정보를 반환하는 API 엔드포인트
 * Authorization 헤더에서 JWT 토큰을 검증하고 해당 사용자 정보를 반환
 */

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = tryGetUserIdFromToken(request)

        if (!result) {
            return NextResponse.json(result, { status: 200 })
        }

        // 디코딩된 userId로 사용자 정보 조회
        const user = await prisma.user.findUnique({
            where: { id: result.userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        console.error('User info search error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
