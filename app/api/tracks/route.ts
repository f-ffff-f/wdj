import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/server/error/errors'
import { handleError } from '@/lib/server/error/handleError'

/**
 * 사용자의 트랙 목록 조회 API 엔드포인트
 * 인증된 사용자의 트랙만 반환
 */
export async function GET(request: Request) {
    try {
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        const tracks = await prisma.track.findMany({
            where: { userId: userId },
            select: {
                id: true,
                fileName: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(tracks)
    } catch (error) {
        console.error('Track retrieval error:', error)
        return handleError(error)
    }
}
