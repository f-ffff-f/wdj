import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { handleApiError } from '@/lib/server/error/handleApiError'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { prisma } from '@/lib/server/prisma'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants' // 'library' 같은 기본 ID
import type { AppResponse } from '@/lib/shared/types'
import type { Track } from '@prisma/client'
import { NextResponse } from 'next/server'

type Params = {
    params: Promise<{
        playlistId: string | typeof PLAYLIST_DEFAULT_ID
    }>
}

// GET /api/playlists/[playlistId]/tracks
export async function GET(request: Request, { params }: Params) {
    try {
        const userId = await getUserIdFromSession()

        if (!userId) {
            return NextResponse.json<AppResponse<never>>(
                { success: false, error: ErrorMessage.USER_NOT_FOUND, statusCode: 401 },
                { status: 401 },
            )
        }

        const { playlistId } = await params
        let tracks: Track[] = []

        if (playlistId === PLAYLIST_DEFAULT_ID) {
            // 모든 트랙 가져오기 (라이브러리)
            tracks = await prisma.track.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            })
        } else {
            // 특정 플레이리스트의 트랙 가져오기
            const playlist = await prisma.playlist.findUnique({
                where: {
                    id: playlistId,
                    userId, // 본인 소유 플레이리스트 확인
                },
                include: {
                    tracks: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            })

            if (!playlist) {
                // 플레이리스트를 찾을 수 없음
                return NextResponse.json<AppResponse<never>>(
                    { success: false, error: ErrorMessage.PLAYLIST_NOT_FOUND, statusCode: 404 },
                    { status: 404 }, // Not Found
                )
            }
            tracks = playlist.tracks ?? []
        }

        return NextResponse.json<AppResponse<Track[]>>({ success: true, data: tracks })
    } catch (error) {
        return handleApiError(error)
    }
}
