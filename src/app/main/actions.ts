'use server'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerActionError } from '@/lib/server/handleServerError'
import { prisma } from '@/lib/shared/prisma'
import { Playlist, Track } from '@prisma/client'

export const getTracks = async (): Promise<Track[]> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()
        const result = await prisma.track.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return result
    } catch (error) {
        console.error(error)
        throw handleServerActionError(error, {
            userId: userId,
            action: 'actions/getTracks',
        })
    }
}

export const getPlaylists = async (): Promise<Playlist[]> => {
    const userId = await getUserIdFromSession()

    try {
        const result = await prisma.playlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return result
    } catch (error) {
        console.error(error)
        throw handleServerActionError(error, {
            userId: userId,
            action: 'actions/getPlaylists',
        })
    }
}
