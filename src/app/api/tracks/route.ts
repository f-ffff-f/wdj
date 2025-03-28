export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/handleServerError'

/**
 * 사용자의 트랙 목록 조회 API 엔드포인트
 * 인증된 사용자의 트랙만 반환
 */
export async function GET() {
    let userId: string | undefined
    try {
        userId = await getUserIdFromSession()

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
        return handleServerError(error, { userId, action: 'api/tracks/GET' })
    }
}
