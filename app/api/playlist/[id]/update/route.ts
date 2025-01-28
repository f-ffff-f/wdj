import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdatePlaylistAPI } from '@/app/types/api'
import { getUserIdFromToken } from '@/app/_lib/utils'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = getUserIdFromToken(request)

        if (result instanceof NextResponse) {
            return result
        }

        const { name } = (await request.json()) as UpdatePlaylistAPI['Request']

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: '플레이리스트 이름은 필수입니다' }, { status: 400 })
        }

        const playlist = await prisma.playlist.update({
            where: {
                id: params.id,
                userId: result.userId,
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

        return NextResponse.json(playlist)
    } catch (error) {
        console.error('플레이리스트 수정 오류:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
    }
}
