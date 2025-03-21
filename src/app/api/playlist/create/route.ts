export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'

/**
 * 새로운 플레이리스트를 생성하는 API 엔드포인트
 * 인증된 사용자만 플레이리스트를 생성할 수 있음
 */
export async function POST(request: Request) {
    let userId: string | undefined

    try {
        // 토큰에서 사용자 ID 확인
        const headersList = await headers()
        userId = getUserIdFromRequest(headersList)

        const body = await request.json()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
        }

        const { name } = parseResult.data

        // 플레이리스트 생성
        const playlist = await prisma.playlist.create({
            data: {
                name: name.trim(),
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        })

        return NextResponse.json(playlist)
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: 'api/playlist/create/POST',
        })
    }
}
