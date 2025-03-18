import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NotFoundError, UnauthorizedError, BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import {
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
    BadRequestErrorMessage,
} from '@/lib/shared/errors/ErrorMessage'
import { LoginSchema } from '@/lib/shared/validations/userSchemas'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Zod로 입력 유효성 검사
        const parseResult = LoginSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
        }

        const { email, password } = parseResult.data

        // 1) 이메일로 유저 조회
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            throw new NotFoundError(NotFoundErrorMessage.USER_NOT_FOUND)
        }

        // 2) 비밀번호 비교
        const isMatch = await bcryptjs.compare(password, user.password!)
        if (!isMatch) {
            throw new UnauthorizedError(UnauthorizedErrorMessage.INVALID_CREDENTIALS)
        }

        // 3) 로그인 성공 - 새 멤버 토큰 발급
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })

        // 4) 응답 객체 생성
        const response = NextResponse.json({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        })

        // 5) 멤버 토큰 쿠키 설정 & 게스트 토큰 삭제
        const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7
        response.cookies.set('memberToken', token, {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            sameSite: 'strict', // CSRF 방지
            path: '/',
            maxAge: ONE_WEEK_IN_SECONDS,
        })
        response.cookies.delete('guestToken')

        return response
    } catch (error) {
        console.error('Login error:', error)
        return handleServerError(error)
    }
}
