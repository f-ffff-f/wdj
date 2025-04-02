import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerActionError } from '@/lib/server/handleServerError'
import { prisma } from '@/lib/shared/prisma'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'
import { Playlist } from '@prisma/client'

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

export const createPlaylist = async (playlistData: { name: string }) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse(playlistData)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
        }

        const { name } = parseResult.data

        // 플레이리스트 생성
        const playlist = await prisma.playlist.create({
            data: {
                name: name.trim(),
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        })

        return playlist
    } catch (error) {
        throw handleServerActionError(error, {
            userId,
            action: 'actions/createPlaylist',
        })
    }
}

export const deletePlaylist = async (id: string) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        await prisma.playlist.delete({
            where: {
                id: id,
                userId: userId,
            },
        })

        return { success: true, message: 'Playlist deleted successfully' }
    } catch (error) {
        throw handleServerActionError(error, {
            userId,
            action: `actions/deletePlaylist/${id}`,
        })
    }
}

export const updatePlaylist = async (id: string, playlistData: { name: string }) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse(playlistData)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
        }

        const { name } = parseResult.data

        const playlist = await prisma.playlist.update({
            where: {
                id: id,
                userId: userId,
            },
            data: {
                name: name.trim(),
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        })

        return playlist
    } catch (error) {
        throw handleServerActionError(error, {
            userId,
            action: `actions/updatePlaylist/${id}`,
        })
    }
}
