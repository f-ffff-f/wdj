export const dynamic = 'force-dynamic'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/handleServerError'
import { prisma } from '@/lib/shared/prisma'

import { NextResponse } from 'next/server'

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    let userId: string | undefined
    try {
        userId = await getUserIdFromSession()

        await prisma.playlist.delete({
            where: {
                id: params.id,
                userId: userId,
            },
        })

        return NextResponse.json({ message: 'Playlist deleted successfully' })
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: `api/playlist/${params.id}/DELETE`,
        })
    }
}
