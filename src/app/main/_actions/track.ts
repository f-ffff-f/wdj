'use server'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { generateS3FilePath, getEnv } from '@/lib/server/utils'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { BadRequestError, NotFoundError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage, NotFoundErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { prisma } from '@/lib/shared/prisma'
import { TServerActionResponse } from '@/lib/shared/types'
import { CreateTrackSchema, UploadUrlRequestSchema } from '@/lib/shared/validations/trackSchema'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Track } from '@prisma/client'

// S3 클라이언트 생성
const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export const getTracks = async (
    playlistId: string | typeof PLAYLIST_DEFAULT_ID,
): Promise<TServerActionResponse<Track[]>> => {
    const userId = await getUserIdFromSession()

    try {
        if (playlistId === PLAYLIST_DEFAULT_ID) {
            const allTracks = await prisma.track.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            })

            return {
                success: true,
                data: allTracks,
            }
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

            return {
                success: true,
                data: playlist?.tracks ?? [],
            }
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to get tracks',
        }
    }
}

/**
 * 트랙 생성 서버 액션
 * 클라이언트에서 업로드할 트랙의 파일명과 연결할 플레이리스트 ID를 받아
 * 데이터베이스에 트랙 정보를 생성한다
 */
export async function uploadTrack(formData: FormData): Promise<TServerActionResponse<Track>> {
    const userId = await getUserIdFromSession()

    try {
        const fileName = formData.get('fileName') as string
        const playlistId = formData.get('playlistId') as string | undefined

        // Zod로 입력 유효성 검사
        const parseResult = CreateTrackSchema.safeParse({
            fileName,
            playlistId,
        })

        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_FILE_NAME)
        }

        const { fileName: validatedFileName, playlistId: validatedPlaylistId } = parseResult.data

        // playlistId가 존재하는 경우만 connect 로직을 추가
        const createData = {
            fileName: validatedFileName.trim(),
            userId,
            playlists: {},
        }

        if (validatedPlaylistId && validatedPlaylistId.trim().length > 0) {
            // playlistId가 있고, 문자열이 유효하면 Track 생성 시 해당 Playlist와 연결
            createData.playlists = {
                connect: [{ id: validatedPlaylistId }],
            }
        }

        const newTrack = await prisma.track.create({
            data: createData,
            select: {
                id: true,
                fileName: true,
                createdAt: true,
                userId: true,
                playlists: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return {
            success: true,
            data: newTrack,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to upload track',
        }
    }
}

/**
 * 트랙 업로드를 위한 presigned URL 생성 서버 액션
 */
export async function getTrackPresignedUrl(
    id: string,
    fileName: string,
    fileType: string,
): Promise<TServerActionResponse<{ url: string; key: string }>> {
    const userId = await getUserIdFromSession()

    try {
        // Zod로 입력 유효성 검사
        const parseResult = UploadUrlRequestSchema.safeParse({
            id,
            fileName,
            fileType,
        })

        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.MISSING_FILE_INFO)
        }

        // 고유 파일 키 생성
        const fileKey = generateS3FilePath(userId, id)

        // S3 업로드 명령 생성
        const putCommand = new PutObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: fileKey,
            ContentType: fileType,
        })

        // 프리사인드 URL 생성 (15분 유효)
        const presignedUrl = await getSignedUrl(s3, putCommand, {
            expiresIn: 15 * 60,
        })

        return {
            success: true,
            data: {
                url: presignedUrl,
                key: fileKey,
            },
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to get track presigned url',
        }
    }
}

/**
 * 트랙 다운로드를 위한 presigned URL 생성 서버 액션
 */
export async function getTrackDownloadUrl(trackId: string): Promise<TServerActionResponse<{ presignedUrl: string }>> {
    const userId = await getUserIdFromSession()

    try {
        // DB에서 트랙 정보 가져오기
        const track = await prisma.track.findUnique({
            where: {
                id: trackId,
                userId,
            },
        })

        if (!track) {
            throw new BadRequestError(BadRequestErrorMessage.MISSING_FILE_INFO)
        }

        const fileKey = generateS3FilePath(userId, track.id)

        // GetObjectCommand 생성
        const getCommand = new GetObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: fileKey,
        })

        // presigned URL 생성 (15분 유효)
        const presignedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 15 * 60 })

        return {
            success: true,
            data: {
                presignedUrl,
            },
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to get track download url',
        }
    }
}

/**
 * 트랙 삭제 서버 액션
 * 데이터베이스에서 트랙을 삭제하고, 멤버인 경우 S3에서도 파일 삭제
 */
export async function deleteTrack(trackId: string): Promise<TServerActionResponse<{ id: string }>> {
    const userId = await getUserIdFromSession()

    try {
        // 트랙이 존재하며, 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: trackId,
                userId,
            },
            select: {
                id: true,
                userId: true,
                user: {
                    select: {
                        role: true,
                    },
                },
            },
        })

        if (!track) {
            throw new NotFoundError(NotFoundErrorMessage.TRACK_UNAUTHORIZED)
        }

        // 멤버 사용자인 경우 S3에서 파일 삭제
        if (track.user?.role === 'MEMBER') {
            const fileKey = generateS3FilePath(track.userId, track.id)

            // S3에서 파일 삭제 명령 실행
            const deleteCommand = new DeleteObjectCommand({
                Bucket: getEnv('AWS_S3_BUCKET_NAME'),
                Key: fileKey,
            })
            await s3.send(deleteCommand)
        }

        // 데이터베이스에서 트랙 삭제
        await prisma.track.delete({
            where: {
                id: trackId,
                userId,
            },
        })

        return {
            success: true,
            data: {
                id: trackId,
            },
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to delete track',
        }
    }
}

/**
 * 모든 트랙 삭제 서버 액션
 * 데이터베이스에서만 모든 트랙 삭제
 */
export async function deleteAllTracksDB(): Promise<TServerActionResponse<null>> {
    const userId = await getUserIdFromSession()

    try {
        // 유저가 존재하고 자기자신인지 확인
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            select: {
                id: true,
                role: true,
            },
        })

        if (!user || user.id !== userId) {
            throw new NotFoundError(NotFoundErrorMessage.USER_NOT_FOUND)
        }

        await prisma.track.deleteMany({
            where: { userId },
        })

        return {
            success: true,
            data: null,
        }
    } catch (error) {
        return {
            success: false,
            message: 'failed to delete all tracks',
        }
    }
}

/**
 * 트랙에 플레이리스트 연결 서버 액션
 */

export async function connectTrackToPlaylist(
    trackId: string,
    playlistId: string,
): Promise<TServerActionResponse<Track>> {
    const userId = await getUserIdFromSession()

    try {
        // 트랙이 존재하며 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: trackId,
                userId,
            },
        })

        if (!track) {
            throw new NotFoundError(NotFoundErrorMessage.TRACK_NOT_FOUND)
        }

        // 플레이리스트가 존재하며 현재 사용자 소유인지 확인
        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
                userId,
            },
        })

        if (!playlist) {
            throw new NotFoundError(NotFoundErrorMessage.PLAYLIST_NOT_FOUND)
        }

        // 트랙과 플레이리스트 연결
        const updatedTrack = await prisma.track.update({
            where: {
                id: trackId,
            },
            data: {
                playlists: {
                    connect: {
                        id: playlistId,
                    },
                },
            },
            include: {
                playlists: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return {
            success: true,
            data: updatedTrack,
        }
    } catch (error) {
        console.error('Error connecting track to playlist:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to connect track to playlist',
        }
    }
}

/**
 * 트랙에서 플레이리스트 연결 해제 서버 액션
 */

export async function disconnectTrackFromPlaylist(
    trackId: string,
    playlistId: string,
): Promise<TServerActionResponse<Track>> {
    const userId = await getUserIdFromSession()

    try {
        // 트랙이 존재하며 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: trackId,
                userId,
            },
        })

        if (!track) {
            throw new NotFoundError(NotFoundErrorMessage.TRACK_NOT_FOUND)
        }

        // 플레이리스트가 존재하며 현재 사용자 소유인지 확인
        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
                userId,
            },
        })

        if (!playlist) {
            throw new NotFoundError(NotFoundErrorMessage.PLAYLIST_NOT_FOUND)
        }

        // 트랙과 플레이리스트 연결 해제
        const updatedTrack = await prisma.track.update({
            where: {
                id: trackId,
            },
            data: {
                playlists: {
                    disconnect: {
                        id: playlistId,
                    },
                },
            },
            include: {
                playlists: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return {
            success: true,
            data: updatedTrack,
        }
    } catch (error) {
        console.error('Error disconnecting track from playlist:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to disconnect track from playlist',
        }
    }
}
