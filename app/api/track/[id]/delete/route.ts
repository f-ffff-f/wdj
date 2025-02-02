import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromToken } from '@/app/_lib/auth/getUserIdFromToken'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getEnv } from '@/app/_lib/utils'

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
        const result = getUserIdFromToken(request)

        // 트랙이 존재하며, 현재 사용자 소유인지 확인
        const track = await prisma.track.findFirst({
            where: {
                id: params.id,
                userId: result.userId,
            },
        })

        if (!track) {
            return NextResponse.json({ error: 'Track not found or unauthorized' }, { status: 404 })
        }

        // S3에서 파일을 삭제하기 위해 track.url에서 key를 추출
        // 예: "https://{bucket}.s3.amazonaws.com/uploads/{userId}/{날짜}/{uuid}-{fileName}"
        // => key: "uploads/{userId}/{날짜}/{uuid}-{fileName}"
        const urlObj = new URL(track.url)
        const rawKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname

        const decodedKey = decodeURIComponent(rawKey)

        // S3에서 파일 삭제 명령 실행
        const deleteCommand = new DeleteObjectCommand({
            Bucket: getEnv('AWS_S3_BUCKET_NAME'),
            Key: decodedKey,
        })
        await s3.send(deleteCommand)

        // 데이터베이스에서 트랙 삭제
        await prisma.track.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'Track deleted successfully' })
    } catch (error) {
        console.error('Track deletion error:', error)
        return NextResponse.json({ error: 'Server error occurred' }, { status: 500 })
    }
}
