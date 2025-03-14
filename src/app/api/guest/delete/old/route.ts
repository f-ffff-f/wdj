import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const runtime = 'nodejs' // Vercel Serverless 환경에서 실행 가능하게 설정

export async function GET(req: NextRequest) {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24) // 24시간 전 계산

    try {
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                role: 'GUEST',
                createdAt: { lt: twentyFourHoursAgo }, // 24시간 지난 GUEST만 삭제
            },
        })

        return NextResponse.json({
            message: `Deleted ${deletedUsers.count} old guest users`,
        })
    } catch (error) {
        console.error('Failed to delete guest users:', error)
        return NextResponse.json({ error: 'Failed to delete guest users' }, { status: 500 })
    }
}
