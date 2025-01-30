import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tryGetUserIdFromToken } from '@/app/_lib/utils'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = tryGetUserIdFromToken(request)

        if (!result) {
            return NextResponse.json(result, { status: 200 })
        }

        await prisma.playlist.delete({
            where: {
                id: params.id,
                userId: result.userId,
            },
        })

        return NextResponse.json({ message: 'Playlist deleted successfully' })
    } catch (error) {
        console.error('Playlist deletion error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
