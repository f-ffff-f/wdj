import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tryGetUserIdFromToken } from '@/app/_lib/utils'

/**
 * 새로운 플레이리스트를 생성하는 API 엔드포인트
 * 인증된 사용자만 플레이리스트를 생성할 수 있음
 */
export async function POST(request: Request) {
    try {
        // 토큰에서 사용자 ID 확인
        const result = tryGetUserIdFromToken(request)

        if (!result) {
            return NextResponse.json(result, { status: 200 })
        }

        // 요청 본문에서 플레이리스트 이름 추출
        const { name } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 })
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

        return NextResponse.json(playlist, { status: 201 })
    } catch (error) {
        console.error('Playlist creation error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
