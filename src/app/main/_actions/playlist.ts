'use server'

import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/error/handleServerError'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { prisma } from '@/lib/server/prisma'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'
import { Playlist } from '@prisma/client'
import { AppResponse } from '@/lib/shared/types'

export const getIsValidPlaylist = async (playlistId: string): Promise<AppResponse<void>> => {
    if (playlistId === PLAYLIST_DEFAULT_ID) {
        return {
            success: true,
        }
    }

    const userId = await getUserIdFromSession()

    try {
        const playlist = await prisma.playlist.findFirst({
            where: { id: playlistId, userId: userId },
        })

        if (!playlist) {
            throw new AppError(ErrorMessage.PLAYLIST_NOT_FOUND)
        }

        return {
            success: true,
        }
    } catch (error) {
        throw handleServerError(error)
    }
}

export const createPlaylist = async (name: string): Promise<AppResponse<Playlist>> => {
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

        return {
            success: true,
            data: playlist,
        }
    } catch (error) {
        throw handleServerError(error)
    }
}

export const updatePlaylist = async (id: string, name: string): Promise<AppResponse<Playlist>> => {
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
                updatedAt: true,
                userId: true,
            },
        })

        return {
            success: true,
            data: playlist,
        }
    } catch (error) {
        throw handleServerError(error)
    }
}

export const deletePlaylist = async (id: string): Promise<AppResponse<void>> => {
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
        }
    } catch (error) {
        throw handleServerError(error)
    }
}
