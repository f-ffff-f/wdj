export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/handleServerError'

export async function DELETE() {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

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
