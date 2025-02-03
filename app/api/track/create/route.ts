// /app/api/track/create/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/auth/getUserIdFromToken'
import { CreateTrackAPI } from '@/app/types/api'

export async function POST(request: Request) {
    try {
        const result = getUserIdFromToken(request)

        // fileName, playlistId를 받을 수 있게 구조분해 할당
        const { fileName, playlistId }: CreateTrackAPI['Request'] = await request.json()

        if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
        }

        // playlistId가 존재하는 경우만 connect 로직을 추가
        const createData = {
            fileName: fileName.trim(),
            userId: result.userId,
            playlists: {},
        }

        if (playlistId && typeof playlistId === 'string' && playlistId.trim().length > 0) {
            // playlistId가 있고, 문자열이 유효하면 Track 생성 시 해당 Playlist와 연결
            createData.playlists = {
                connect: [{ id: playlistId }],
            }
        }

        const newTrack = await prisma.track.create({
            data: createData,
            select: {
                id: true,
                fileName: true,
                createdAt: true,
                // playlistId를 포함해 반환하려면 아래 처럼 필요
                playlists: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(newTrack, { status: 201 })
    } catch (error) {
        console.error('Track creation error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
