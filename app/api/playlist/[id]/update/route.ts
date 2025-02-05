import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError, BadRequestError } from '@/lib/server/error/errors'
import { handleError } from '@/lib/server/error/handleError'
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        const { name } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new BadRequestError('Playlist name is required')
        }

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
        return handleError(error)
    }
}
