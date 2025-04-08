'use server'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { prisma } from '@/lib/shared/prisma'
import { PlaylistSchema } from '@/lib/shared/validations/playlistSchema'
import { Playlist } from '@prisma/client'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'

export const getPlaylists = async (): Promise<Playlist[]> => {
    const userId = await getUserIdFromSession()

    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        })

        return playlists
    } catch (error) {
        throw new Error('failed to get playlists')
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
            throw new Error('Playlist not found')
        }

        return true
    } catch (error) {
        throw new Error('failed to find playlist')
    }
}

export const createPlaylist = async (name: string): Promise<Playlist> => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new Error('Invalid playlist name')
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
        throw new Error('failed to create playlist')
    }
}

export const updatePlaylist = async (id: string, name: string) => {
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // Zod로 입력 유효성 검사
        const parseResult = PlaylistSchema.safeParse({ name })
        if (!parseResult.success) {
            throw new Error('Invalid playlist name')
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
        throw new Error('failed to update playlist')
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
        throw new Error('failed to delete playlist')
    }
}
