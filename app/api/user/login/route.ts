import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // 1) 이메일로 유저 조회
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 2) 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 3) 로그인 성공
        // 실제 서비스라면 여기서 세션 쿠키 or JWT 발급 등 추가 로직
        return NextResponse.json({ message: 'Login success', user })
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
