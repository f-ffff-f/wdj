import { getUserIdFromToken } from '@/app/_lib/utils'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

/**
 * 플레이리스트에 트랙 추가 API 엔드포인트
 * 인증된 사용자만 자신의 플레이리스트에 트랙 추가 가능
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        // 인증 처리
        const result = getUserIdFromToken(request)
        if (!result) return NextResponse.json(result, { status: 401 })

        // 요청 본문 유효성 검사
        const { trackIds } = await request.json()
        if (!Array.isArray(trackIds) || trackIds.some((id) => typeof id !== 'string')) {
            return NextResponse.json({ error: 'Invalid track IDs format' }, { status: 400 })
        }

        // 플레이리스트 소유권 확인
        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: result.userId,
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
                        url: true,
                    },
                },
            },
        })

        return NextResponse.json(playlist, { status: 200 })
    } catch (error) {
        console.error('Add tracks to playlist error:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Playlist or track not found' }, { status: 404 })
            }
        }
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}

/**
 * 특정 플레이리스트의 트랙 목록 조회 API
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = getUserIdFromToken(request)
        if (!result) return NextResponse.json(result, { status: 401 })

        const playlist = await prisma.playlist.findUnique({
            where: {
                id: params.id,
                userId: result.userId,
            },
            include: {
                tracks: {
                    select: {
                        id: true,
                        fileName: true,
                        url: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })

        return NextResponse.json(playlist.tracks)
    } catch (error) {
        console.error('Get playlist tracks error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}

/**
 * 플레이리스트에서 트랙 삭제 API
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // 인증 처리
        const result = getUserIdFromToken(request)
        if (!result) return NextResponse.json(result, { status: 401 })

        // 요청 본문 유효성 검사
        const { trackIds } = await request.json()
        if (!Array.isArray(trackIds) || trackIds.some((id) => typeof id !== 'string')) {
            return NextResponse.json({ error: 'Invalid track IDs format' }, { status: 400 })
        }

        // 플레이리스트 소유권 확인 및 트랙 제거
        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: result.userId,
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
                        url: true,
                    },
                },
            },
        })

        return NextResponse.json(playlist, { status: 200 })
    } catch (error) {
        console.error('Remove tracks from playlist error:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Playlist or track not found' }, { status: 404 })
            }
        }
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
