export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { CreateTrackSchema } from '@/lib/shared/validations/trackSchema'

export async function POST(request: Request) {
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

        const body = await request.json()

        // Zod로 입력 유효성 검사
        const parseResult = CreateTrackSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_FILE_NAME)
        }

        const { fileName, playlistId } = parseResult.data

        // playlistId가 존재하는 경우만 connect 로직을 추가
        const createData = {
            fileName: fileName.trim(),
            userId: userId,
            playlists: {},
        }

        if (playlistId && playlistId.trim().length > 0) {
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

        return NextResponse.json(newTrack)
    } catch (error) {
        console.error('Track creation error:', error)
        return handleServerError(error)
    }
}
