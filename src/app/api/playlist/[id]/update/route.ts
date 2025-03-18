export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError, BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { BadRequestErrorMessage, UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        const body = await request.json()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
        }

        const { name } = parseResult.data

        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: userId,
            },
            data: {
                name: name.trim(),
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Playlist update error:', error)
        return handleServerError(error)
    }
}
