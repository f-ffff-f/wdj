import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError, BadRequestError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        const { name } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new BadRequestError('Invalid playlist name')
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
        return handleServerError(error)
    }
}
