// /app/api/upload/presigned-url/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { generateS3FileKey, getEnv, getUserIdFromRequest } from '@/lib/server/utils'
import { BadRequestError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'
import { BadRequestErrorMessage, UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { UploadUrlRequestSchema } from '@/lib/shared/validations/trackSchema'
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
            throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
        }

        const body = await req.json()

        // Zod로 입력 유효성 검사
        const parseResult = UploadUrlRequestSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.MISSING_FILE_INFO)
        }

        const { fileName, fileType, id } = parseResult.data

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
