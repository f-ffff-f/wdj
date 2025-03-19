export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { generateS3FileKey, getEnv, getUserIdFromRequest } from '@/lib/server/utils'
import { NotFoundError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { NotFoundErrorMessage, UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'

// S3 클라이언트 생성
const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        // DB에서 트랙 정보 가져오기
        const track = await prisma.track.findUnique({
            where: { id: params.id },
        })

        if (!track) {
            throw new NotFoundError(NotFoundErrorMessage.TRACK_NOT_FOUND)
        }

        const fileKey = generateS3FileKey(userId, track.id)

        // GetObjectCommand 생성
        const getCommand = new GetObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: fileKey,
        })

        // presigned URL 생성 (예: 15분 유효)
        const presignedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 15 * 60 })

        // 클라이언트에 트랙 정보와 presigned URL 반환
        return NextResponse.json({
            ...track,
            presignedUrl,
        })
    } catch (error) {
        console.error('Error fetching track:', error)
        return handleServerError(error)
    }
}
