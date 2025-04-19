import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { handleApiError } from '@/lib/server/error/handleApiError' // 아래에서 만들 에러 핸들러
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { prisma } from '@/lib/server/prisma' // Prisma 클라이언트 경로
import type { AppResponse } from '@/lib/shared/types' // 공유 타입
import type { Playlist } from '@prisma/client' // Prisma 모델 타입
import { NextResponse } from 'next/server'

// GET /api/playlists
export async function GET() {
    try {
        const userId = await getUserIdFromSession()

        if (!userId) {
            return NextResponse.json<AppResponse<never>>(
                { success: false, error: ErrorMessage.USER_NOT_FOUND, statusCode: 401 },
                { status: 401 },
            )
        }

        const playlists = await prisma.playlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json<AppResponse<Playlist[]>>({ success: true, data: playlists })
    } catch (error) {
        return handleApiError(error) // 에러 핸들러 사용
    }
}
