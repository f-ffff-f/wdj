'use server'

import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/error/handleServerError'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { prisma } from '@/lib/shared/prisma'
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
        return handleServerError(error)
    }
}

export const getIsValidPlaylist = async (playlistId: string): Promise<boolean> => {
    if (playlistId === PLAYLIST_DEFAULT_ID) {
        return true
    }

    const userId = await getUserIdFromSession()

    try {
        const playlist = await prisma.playlist.findFirst({
            where: { id: playlistId, userId: userId },
        })

        if (!playlist) {
            throw new AppError(ErrorMessage.PLAYLIST_NOT_FOUND)
        }

        return true
    } catch (error) {
        return handleServerError(error)
    }
}

export const createPlaylist = async (name: string): Promise<Playlist> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new AppError(ErrorMessage.INVALID_PLAYLIST_NAME)
        }

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
                updatedAt: true,
                userId: true,
            },
        })

        return playlist
    } catch (error) {
        return handleServerError(error)
    }
}

export const updatePlaylist = async (id: string, name: string) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new AppError(ErrorMessage.INVALID_PLAYLIST_NAME)
        }

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
        return handleServerError(error)
    }
}

export const deletePlaylist = async (id: string): Promise<void> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        await prisma.playlist.delete({
            where: {
                id: id,
                userId: userId,
            },
        })
    } catch (error) {
        return handleServerError(error)
    }
}
