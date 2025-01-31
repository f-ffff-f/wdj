import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/utils'

/**
 * 트랙 삭제 API 엔드포인트
 * 소유자만 트랙 삭제 가능
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = getUserIdFromToken(request)

        await prisma.track.delete({
            where: {
                id: params.id,
                userId: result.userId,
            },
        })

        return NextResponse.json({ message: 'Track deleted successfully' })
    } catch (error) {
        console.error('Track deletion error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
