import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GetPlaylistsAPI } from '@/app/types/api'
import { getUserIdFromToken } from '@/app/_lib/utils'

/**
 * 사용자의 플레이리스트 목록을 조회하는 API 엔드포인트
 * 인증된 사용자의 플레이리스트만 반환
 */
export async function GET(request: Request) {
    try {
        // 토큰에서 사용자 ID 확인
        const result = getUserIdFromToken(request)

        if (result instanceof NextResponse) {
            return result
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
        const response: GetPlaylistsAPI['Response'] = playlists.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            createdAt: playlist.createdAt,
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('플레이리스트 조회 오류:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
    }
}
