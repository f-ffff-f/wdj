export const dynamic = 'force-dynamic'

import { getUserIdFromSession } from '@/lib/server/getUserIdFromSession'
import { handleServerError } from '@/lib/server/handleServerError'
import { generateS3FilePath, getEnv } from '@/lib/server/utils'
import { NotFoundError } from '@/lib/shared/errors/CustomError'
import { NotFoundErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { prisma } from '@/lib/shared/prisma'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { NextResponse } from 'next/server'

// S3 클라이언트 인스턴스 생성
const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    let userId: string | undefined

    try {
        userId = await getUserIdFromSession()

        // 트랙이 존재하며, 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: params.id,
                userId: userId,
            },
        })

        if (!track) {
            throw new NotFoundError(NotFoundErrorMessage.TRACK_UNAUTHORIZED)
        }

        const fileKey = generateS3FilePath(userId, track.id)

        // S3에서 파일 삭제 명령 실행
        const deleteCommand = new DeleteObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: fileKey,
        })
        await s3.send(deleteCommand)

        // 데이터베이스에서 트랙 삭제
        await prisma.track.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Track deleted successfully' })
    } catch (error) {
        return handleServerError(error, {
            userId,
            action: `api/tracks/${params.id}/DELETE`,
        })
    }
}
