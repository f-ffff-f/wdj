import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreatePlaylistAPI } from '@/app/types/api'
import { getUserIdFromToken } from '@/app/_lib/utils'

/**
 * 새로운 플레이리스트를 생성하는 API 엔드포인트
 * 인증된 사용자만 플레이리스트를 생성할 수 있음
 */
export async function POST(request: Request) {
    try {
        // 토큰에서 사용자 ID 확인
        const result = getUserIdFromToken(request)

        if (result instanceof NextResponse) {
            return result
        }

        // 요청 본문에서 플레이리스트 이름 추출
        const { name } = (await request.json()) as CreatePlaylistAPI['Request']

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: '플레이리스트 이름은 필수입니다' }, { status: 400 })
        }

        // 플레이리스트 생성
        const playlist = await prisma.playlist.create({
            data: {
                name: name.trim(),
                userId: result.userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        })

        return NextResponse.json(playlist as CreatePlaylistAPI['Response'], { status: 201 })
    } catch (error) {
        console.error('플레이리스트 생성 오류:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
    }
}
