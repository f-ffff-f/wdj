import { getUserIdFromRequest } from '@/app/_libServer/utils'
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/app/_libServer/CustomErrors'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleServerError } from '@/app/_libServer/handleServerError'

/**
 * 플레이리스트에 트랙 추가 API 엔드포인트
 * 인증된 사용자만 자신의 플레이리스트에 트랙 추가 가능
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        // 인증 처리
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // 요청 본문 유효성 검사
        const { trackIds } = await request.json()
        if (!Array.isArray(trackIds) || trackIds.some((id) => typeof id !== 'string')) {
            throw new BadRequestError('Invalid track IDs format')
        }

        // 플레이리스트 소유권 확인
        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: userId,
            },
            data: {
                tracks: {
                    connect: trackIds.map((id) => ({ id })),
                },
            },
            select: {
                id: true,
                name: true,
                tracks: {
                    select: {
                        id: true,
                        fileName: true,
                    },
                },
            },
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Add tracks to playlist error:', error)
        return handleServerError(error)
    }
}

/**
 * 특정 플레이리스트의 트랙 목록 조회 API
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                id: params.id,
                userId: userId,
            },
            include: {
                tracks: {
                    select: {
                        id: true,
                        fileName: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!playlist) throw new NotFoundError('Playlist not found')

        return NextResponse.json(playlist.tracks)
    } catch (error) {
        console.error('Get playlist tracks error:', error)
        return handleServerError(error)
    }
}

/**
 * 플레이리스트에서 트랙 삭제 API
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // 인증 처리
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // 요청 본문 유효성 검사
        const { trackIds } = await request.json()
        if (!Array.isArray(trackIds) || trackIds.some((id) => typeof id !== 'string')) {
            throw new BadRequestError('Invalid track IDs format')
        }

        // 플레이리스트 소유권 확인 및 트랙 제거
        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: userId,
            },
            data: {
                tracks: {
                    disconnect: trackIds.map((id) => ({ id })),
                },
            },
            select: {
                id: true,
                name: true,
                tracks: {
                    select: {
                        id: true,
                        fileName: true,
                    },
                },
            },
        })

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('Remove tracks from playlist error:', error)
        return handleServerError(error)
    }
}
