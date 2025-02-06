import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { generateS3FileKey, getEnv, getUserIdFromRequest } from '@/lib/server/utils'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
// S3 클라이언트 인스턴스 생성
const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        // 트랙이 존재하며, 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: params.id,
                userId: userId,
            },
        })

        if (!track) {
            throw new NotFoundError('Track not found or unauthorized')
        }

        const fileKey = generateS3FileKey(userId, track.id)

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
        console.error('Track deletion error:', error)
        return handleServerError(error)
    }
}
