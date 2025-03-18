export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
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
