import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/auth/getUserIdFromToken'

/**
 * 사용자의 트랙 목록 조회 API 엔드포인트
 * 인증된 사용자의 트랙만 반환
 */
export async function GET(request: Request) {
    try {
        const result = getUserIdFromToken(request)

        const tracks = await prisma.track.findMany({
            where: { userId: result.userId },
            select: {
                id: true,
                fileName: true,
                url: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(tracks)
    } catch (error) {
        console.error('Track retrieval error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
