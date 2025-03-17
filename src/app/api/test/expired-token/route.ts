import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * 테스트 전용 API - 만료된 토큰을 쿠키에 설정
 * 실제 애플리케이션과 동일한 형식의 토큰이지만 이미 만료된 상태
 */
export async function GET() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        // 현재 시간보다 1시간 전에 만료된 토큰 생성
        const ONE_HOUR_IN_SECONDS = 60 * 60
        const expiredDate = Math.floor(Date.now() / 1000) - ONE_HOUR_IN_SECONDS

        // 만료된 토큰 생성 (exp 클레임을 과거 시간으로 설정)
        const expiredToken = jwt.sign(
            {
                userId: 'test-user-id',
                exp: expiredDate, // 이미 만료된 시간
            },
            process.env.JWT_SECRET,
        )

        // 응답 객체 생성
        const response = NextResponse.json({
            success: true,
            message: '만료된 토큰이 쿠키에 설정되었습니다',
        })

        // 만료된 토큰을 쿠키에 설정
        response.cookies.set('memberToken', expiredToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Expired token generation error:', error)
        return NextResponse.json({ error: 'Failed to generate expired token' }, { status: 500 })
    }
}
