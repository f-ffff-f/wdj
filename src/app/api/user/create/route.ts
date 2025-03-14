import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import { BadRequestError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // 1) email 중복 체크
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            throw new BadRequestError('User already exists')
        }

        // 2) 비밀번호 해싱
        const hashedPassword = await bcryptjs.hash(password, 10)

        // 3) DB에 유저 생성
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'MEMBER',
            },
        })

        return NextResponse.json({ message: 'User created', user }, { status: 201 })
    } catch (error) {
        console.error('User creation error:', error)
        return handleServerError(error)
    }
}
