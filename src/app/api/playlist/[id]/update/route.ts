export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

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
