import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/auth/getUserIdFromToken'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const result = getUserIdFromToken(request)

        const { name } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 })
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
        console.error('Playlist update error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
