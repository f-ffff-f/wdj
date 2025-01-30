import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tryGetUserIdFromToken } from '@/app/_lib/utils'

/**
 * 사용자의 플레이리스트 목록을 조회하는 API 엔드포인트
 * 인증된 사용자의 플레이리스트만 반환
 */
export async function GET(request: Request) {
    try {
        // 토큰에서 사용자 ID 확인
        const result = tryGetUserIdFromToken(request)

        if (!result) {
            return NextResponse.json(result, { status: 200 })
        }

        // 사용자의 플레이리스트 조회
        const playlists = await prisma.playlist.findMany({
            where: {
                userId: result.userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // 응답 데이터 형식 변환
        const response = playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            createdAt: playlist.createdAt,
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('Playlist retrieval error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
