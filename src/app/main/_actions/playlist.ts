'use server'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { prisma } from '@/lib/shared/prisma'
import { BadRequestError, NotFoundError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage, NotFoundErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'
import { Playlist } from '@prisma/client'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { TServerActionResponse } from '@/lib/shared/types'

export const getPlaylists = async (): Promise<TServerActionResponse<Playlist[]>> => {
    const userId = await getUserIdFromSession()

    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return {
            success: true,
            data: playlists,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to get playlists',
        }
    }
}

export const getIsValidPlaylist = async (playlistId: string): Promise<TServerActionResponse<boolean>> => {
    if (playlistId === PLAYLIST_DEFAULT_ID) {
        return {
            success: true,
            data: true,
        }
    }

    const userId = await getUserIdFromSession()

    try {
        const playlist = await prisma.playlist.findFirst({
            where: { id: playlistId, userId: userId },
        })

        if (!playlist) {
            throw new NotFoundError(NotFoundErrorMessage.PLAYLIST_NOT_FOUND)
        }

        return {
            success: true,
            data: true,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to find playlist',
        }
    }
}

export const createPlaylist = async (name: string): Promise<TServerActionResponse<Playlist>> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
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

        return {
            success: true,
            data: playlist,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to create playlist',
        }
    }
}

export const updatePlaylist = async (id: string, name: string) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_PLAYLIST_NAME)
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

        return {
            success: true,
            data: playlist,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to update playlist',
        }
    }
}

export const deletePlaylist = async (id: string): Promise<TServerActionResponse<null>> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        await prisma.playlist.delete({
            where: {
                id: id,
                userId: userId,
            },
        })

        return {
            success: true,
            data: null,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to delete playlist',
        }
    }
}
