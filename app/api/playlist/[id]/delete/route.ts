import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/server/error/errors'
import { handleError } from '@/lib/server/error/handleError'
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        await prisma.playlist.delete({
            where: {
                id: params.id,
                userId: userId,
            },
        })

        return NextResponse.json({ message: 'Playlist deleted successfully' })
    } catch (error) {
        console.error('Playlist deletion error:', error)
        return handleError(error)
    }
}
