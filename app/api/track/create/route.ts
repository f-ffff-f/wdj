import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tryGetUserIdFromToken } from '@/app/_lib/utils'

/**
 * 새로운 트랙을 생성하는 API 엔드포인트
 * 인증된 사용자만 트랙 생성 가능
 */
export async function POST(request: Request) {
    try {
        const result = tryGetUserIdFromToken(request)
        if (!result) {
            return NextResponse.json(result, { status: 200 })
        }

        const { fileName, url } = await request.json()

        if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
        }

        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
        }

        const newTrack = await prisma.track.create({
            data: {
                fileName: fileName.trim(),
                url: url.trim(),
                userId: result.userId,
            },
            select: {
                id: true,
                fileName: true,
                url: true,
                createdAt: true,
            },
        })

        return NextResponse.json(newTrack, { status: 201 })
    } catch (error) {
        console.error('Track creation error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
