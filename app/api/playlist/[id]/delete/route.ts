import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/app/_libServer/utils'
import { UnauthorizedError } from '@/app/_libServer/CustomErrors'
import { handleServerError } from '@/app/_libServer/handleServerError'
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
        return handleServerError(error)
    }
}
