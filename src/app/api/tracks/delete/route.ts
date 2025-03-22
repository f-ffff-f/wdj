export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

export async function DELETE() {
    let userId: string | undefined

    try {
        const headersList = await headers()
        userId = getUserIdFromRequest(headersList)

        await prisma.track.deleteMany({
            where: {
                userId: userId,
            },
        })

        return NextResponse.json({ message: 'Tracks deleted successfully' })
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: 'api/tracks/delete/DELETE',
        })
    }
}
