export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
/**
 * 사용자의 플레이리스트 목록을 조회하는 API 엔드포인트
 * 인증된 사용자의 플레이리스트만 반환
 */
export async function GET() {
    let userId: string | undefined

    try {
        const headersList = await headers()
        userId = getUserIdFromRequest(headersList)

        const playlists = await prisma.playlist.findMany({
            where: {
                userId,
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

        const response = playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            createdAt: playlist.createdAt,
        }))

        return NextResponse.json(response)
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: 'api/playlist/GET',
        })
    }
}
