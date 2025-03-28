'use server'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerActionError } from '@/lib/server/handleServerError'
import { prisma } from '@/lib/shared/prisma'
import { Playlist, Track } from '@prisma/client'

export const getTracks = async (playlistId: string): Promise<Track[]> => {
    const userId = await getUserIdFromSession()

    try {
        // 'library'는 특별한 케이스로 모든 트랙을 가져옴
        if (playlistId === 'library') {
            const allTracks = await prisma.track.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            })

            return allTracks
        } else {
            // 특정 플레이리스트의 트랙만 가져옴
            const playlist = await prisma.playlist.findUnique({
                where: {
                    id: playlistId,
                    userId,
                },
                include: {
                    tracks: true,
                },
            })

            return playlist?.tracks ?? []
        }
    } catch (error) {
        console.error(error)
        throw handleServerActionError(error, {
            userId,
            action: `actions/getTracks/${playlistId}`,
        })
    }
}

export const getPlaylists = async (): Promise<Playlist[]> => {
    const userId = await getUserIdFromSession()

    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return playlists
    } catch (error) {
        console.error(error)
        throw handleServerActionError(error, {
            userId: userId,
            action: 'actions/getPlaylists',
        })
    }
}
