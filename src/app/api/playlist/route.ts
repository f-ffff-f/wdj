export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
/**
 * 사용자의 플레이리스트 목록을 조회하는 API 엔드포인트
 * 인증된 사용자의 플레이리스트만 반환
 */
export async function GET() {
    try {
        // 토큰에서 사용자 ID 확인
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        // 사용자의 플레이리스트 조회
        const playlists = await prisma.playlist.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // 응답 데이터 형식 변환
        const response = playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            createdAt: playlist.createdAt,
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('Playlist retrieval error:', error)
        return handleServerError(error)
    }
}
