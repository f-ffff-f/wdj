// /app/api/upload/presigned-url/route.ts
export const dynamic = 'force-dynamic'

import { getUserIdFromRequest } from '@/lib/server/getUserIdFromRequest'
import { handleServerError } from '@/lib/server/handleServerError'
import { generateS3FilePath, getEnv } from '@/lib/server/utils'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { UploadUrlRequestSchema } from '@/lib/shared/validations/trackSchema'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export const POST = async (req: Request) => {
    try {
        const headersList = await headers()
        const userId = getUserIdFromRequest(headersList)

        const body = await req.json()

        // Zod로 입력 유효성 검사
        const parseResult = UploadUrlRequestSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.MISSING_FILE_INFO)
        }

        const { fileType, id } = parseResult.data

        // 고유 파일 키 생성
        const fileKey = generateS3FilePath(userId, id)

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
