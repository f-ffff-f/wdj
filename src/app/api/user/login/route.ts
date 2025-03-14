import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // 1) 이메일로 유저 조회
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            throw new NotFoundError('User not found')
        }

        // 2) 비밀번호 비교
        const isMatch = await bcryptjs.compare(password, user.password!)
        if (!isMatch) {
            throw new UnauthorizedError('Invalid credentials')
        }

        // 3) 로그인 성공
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })

        return NextResponse.json({
            ...user,
            token,
        })
    } catch (error) {
        console.error('Login error:', error)
        return handleServerError(error)
    }
}
