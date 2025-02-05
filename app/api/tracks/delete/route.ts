import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/server/error/errors'
import { handleError } from '@/lib/server/error/handleError'

export async function DELETE(request: Request) {
    try {
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        await prisma.track.deleteMany({
            where: {
                userId: userId,
            },
        })

        return NextResponse.json({ message: 'Tracks deleted successfully' })
    } catch (error) {
        console.error('Tracks deletion error:', error)
        return handleError(error)
    }
}
