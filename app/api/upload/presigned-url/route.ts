import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

// 환경 변수 유효성 검사
const getEnv = (key: string): string => {
    const value = process.env[key]
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value
}

const s3 = new S3Client({
    region: getEnv('AWS_REGION'),
    credentials: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
})

export const POST = async (req: Request) => {
    try {
        const { fileName, fileType } = await req.json()

        // 입력 유효성 검사
        if (!fileName || !fileType) {
            return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 })
        }

        // 고유 파일 키 생성
        const fileKey = `uploads/${new Date().toISOString().split('T')[0]}/${uuidv4()}-${fileName}`

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
