import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/utils'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = getUserIdFromToken(request)

        if (result instanceof NextResponse) {
            return result
        }

        await prisma.playlist.delete({
            where: {
                id: params.id,
                userId: result.userId,
            },
        })

        return NextResponse.json({ message: '플레이리스트가 삭제되었습니다' })
    } catch (error) {
        console.error('플레이리스트 삭제 오류:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
    }
}
