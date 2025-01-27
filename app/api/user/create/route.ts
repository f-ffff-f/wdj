import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // 1) email 중복 체크
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        // 2) 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10)

        // 3) DB에 유저 생성
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json({ message: 'User created', user }, { status: 201 })
    } catch (err) {
        console.error('User creation error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
