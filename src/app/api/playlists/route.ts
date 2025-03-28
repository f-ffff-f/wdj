export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/handleServerError'

/** @deprecated */
export async function GET() {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        const playlists = await prisma.playlist.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const response = playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            createdAt: playlist.createdAt,
        }))

        return NextResponse.json(response)
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: 'api/playlist/GET',
        })
    }
}
