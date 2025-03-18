export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

export async function DELETE() {
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
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
