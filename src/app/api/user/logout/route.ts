import { NextResponse } from 'next/server'
import { handleServerError } from '@/lib/server/handleServerError'

/**
 * 로그아웃 API 엔드포인트
 * 모든 인증 쿠키를 제거하고 세션 종료
 */
export async function POST(request: Request) {
    try {
        // 응답 객체 생성
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        })

        // 모든 인증 쿠키 제거 (멤버 및 게스트)
        response.cookies.delete('memberToken')
        response.cookies.delete('guestToken')

        return response
    } catch (error) {
        console.error('Logout error:', error)
        return handleServerError(error)
    }
}
