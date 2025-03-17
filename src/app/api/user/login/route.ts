import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'
import { handleServerError } from '@/lib/server/handleServerError'
import { headers } from 'next/headers'

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

        // 3) 미들웨어에서 전달된 현재 인증된 사용자(프로세스 상 게스트) ID 확인
        const headersList = headers()
        const guestId = headersList.get('x-user-id')

        // 4) 로그인 성공 - 새 멤버 토큰 발급
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })

        // 5) 응답 객체 생성
        const response = NextResponse.json({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        })

        // 6) 멤버 토큰 쿠키 설정 & 게스트 토큰 삭제
        const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7
        response.cookies.set('memberToken', token, {
            httpOnly: true, // JavaScript에서 접근 불가
            secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
            sameSite: 'strict', // CSRF 방지
            path: '/',
            maxAge: ONE_WEEK_IN_SECONDS,
        })
        response.cookies.delete('guestToken')

        // 7) 게스트 사용자 DB에서 삭제 (있는 경우)
        if (guestId) {
            try {
                await prisma.user.delete({
                    where: {
                        id: guestId,
                        role: 'GUEST',
                    },
                })
                console.log(`게스트 사용자(ID: ${guestId}) 삭제 완료`)
            } catch (deleteError) {
                // 게스트 삭제 실패해도 로그인은 성공 처리
                console.error('게스트 삭제 실패:', deleteError)
            }
        }

        return response
    } catch (error) {
        console.error('Login error:', error)
        return handleServerError(error)
    }
}
