import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/server/utils'
import { UnauthorizedError, BadRequestError } from '@/lib/server/error/errors'
import { handleError } from '@/lib/server/error/handleError'
/**
 * 새로운 플레이리스트를 생성하는 API 엔드포인트
 * 인증된 사용자만 플레이리스트를 생성할 수 있음
 */
export async function POST(request: Request) {
    try {
        // 토큰에서 사용자 ID 확인
        const userId = getUserIdFromRequest(request)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // 요청 본문에서 플레이리스트 이름 추출
        const { name } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new BadRequestError('Playlist name is required')
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
            },
        })

        return NextResponse.json(playlist, { status: 201 })
    } catch (error) {
        console.error('Playlist creation error:', error)
        return handleError(error)
    }
}
