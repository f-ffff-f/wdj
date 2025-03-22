export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

/**
 * 사용자의 트랙 목록 조회 API 엔드포인트
 * 인증된 사용자의 트랙만 반환
 */
export async function GET() {
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

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
        return handleServerError(error)
    }
}
