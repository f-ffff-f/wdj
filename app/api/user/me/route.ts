import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { UserDTO } from '@/types/dto'
import { UserMeAPI } from '@/types/api'
import { getUserIdFromToken } from '@/lib/auth'

/**
 * 인증된 사용자의 정보를 반환하는 API 엔드포인트
 * Authorization 헤더에서 JWT 토큰을 검증하고 해당 사용자 정보를 반환
 */

export async function GET(request: Request): Promise<NextResponse<UserMeAPI['Response']>> {
    try {
        const userId = getUserIdFromToken(request)

        // 디코딩된 userId로 사용자 정보 조회
        const user: UserDTO | null = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user as UserMeAPI['Response'])
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        console.error('User info search error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
