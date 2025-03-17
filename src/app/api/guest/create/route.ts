import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { handleServerError } from '@/lib/server/handleServerError'

export async function POST(request: Request) {
    try {
        const user = await prisma.user.create({
            data: {
                role: 'GUEST',
                email: null,
                password: null,
            },
        })

        // JWT 토큰 생성
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        // 응답 객체 생성
        const response = NextResponse.json({
            message: 'Guest created',
            user: {
                id: user.id,
                role: user.role,
                createdAt: user.createdAt,
            },
        })

        // 게스트용 세션 쿠키 설정 (브라우저 닫으면 만료)
        response.cookies.set('guestToken', token, {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            sameSite: 'strict', // CSRF 방지
            path: '/',
            // maxAge 설정 없음 - 세션 쿠키로 설정
        })

        return response
    } catch (error) {
        console.error('Guest creation error:', error)
        return handleServerError(error)
    }
}
