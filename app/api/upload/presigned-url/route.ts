// /app/api/upload/presigned-url/route.ts
import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserIdFromToken } from '@/app/_lib/auth/getUserIdFromToken'
import { generateS3FileKey, getEnv } from '@/app/_lib/utils'

const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export const POST = async (req: Request) => {
    try {
        const result = getUserIdFromToken(req)

        const { fileName, fileType, id } = await req.json()

        // 입력 유효성 검사
        if (!fileName || !fileType) {
            return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 })
        }

        // 고유 파일 키 생성
        const fileKey = generateS3FileKey(result.userId, id)

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
        return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 })
    }
}
