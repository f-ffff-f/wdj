import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/backend/auth/getUserIdFromToken'

export async function DELETE(request: Request) {
    try {
        const result = getUserIdFromToken(request)

        await prisma.track.deleteMany({
            where: {
                userId: result.userId,
            },
        })

        return NextResponse.json({ message: 'Tracks deleted successfully' })
    } catch (error) {
        console.error('Tracks deletion error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
