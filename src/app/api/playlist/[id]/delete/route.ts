export const dynamic = 'force-dynamic'

import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { handleServerError } from '@/lib/server/handleServerError'
import { prisma } from '@/lib/shared/prisma'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

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
