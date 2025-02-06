import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

export async function DELETE() {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

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
        return handleServerError(error)
    }
}
