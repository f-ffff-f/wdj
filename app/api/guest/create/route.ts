import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { handleError } from '@/lib/server/error/handleError'

export async function POST(request: Request) {
    try {
        const user = await prisma.user.create({
            data: {
                role: 'GUEST',
                email: null,
                password: null,
            },
        })

        // JWT 토큰 생성 (로그인 API와 동일한 방식)
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        return NextResponse.json(
            {
                message: 'Guest created',
                user: {
                    id: user.id,
                    role: user.role,
                    createdAt: user.createdAt,
                },
                token, // 클라이언트에 전달할 토큰 추가
            },
            { status: 201 },
        )
    } catch (err) {
        console.error('Guest creation error:', err)
        return handleError(err)
    }
}
