// /app/api/upload/presigned-url/route.ts
import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { generateS3FileKey, getEnv, getUserIdFromRequest } from '@/lib/server/utils'
import { BadRequestError, UnauthorizedError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export const POST = async (req: Request) => {
    try {
        const headersList = headers()
        const userId = getUserIdFromRequest(headersList)

        if (!userId) {
            throw new UnauthorizedError('User not authenticated')
        }

        const { fileName, fileType, id } = await req.json()

        // 입력 유효성 검사
        if (!fileName || !fileType) {
            throw new BadRequestError('fileName and fileType are required')
        }

        // 고유 파일 키 생성
        const fileKey = generateS3FileKey(userId, id)

        // S3 업로드 명령 생성
        const putCommand = new PutObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: fileKey,
            ContentType: fileType,
        })

        // 프리사인드 URL 생성 (15분 유효)
        const presignedUrl = await getSignedUrl(s3, putCommand, {
            expiresIn: 15 * 60,
        })

        return NextResponse.json({
            url: presignedUrl,
            key: fileKey,
        })
    } catch (error) {
        console.error('Presigned URL generation error:', error)
        return handleServerError(error)
    }
}
