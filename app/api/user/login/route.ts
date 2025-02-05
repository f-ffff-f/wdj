import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserLoginAPI } from '@/app/_lib/types/api'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // 1) 이메일로 유저 조회
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 })
        }

        // 2) 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password!)
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // 3) 로그인 성공
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined')
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })

        return NextResponse.json({
            message: 'Login success',
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            token,
        } as UserLoginAPI['Response'])
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
