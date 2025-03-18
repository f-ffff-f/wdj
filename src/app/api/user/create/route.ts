import { NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerError } from '@/lib/server/handleServerError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { CreateUserSchema } from '@/lib/shared/validations/userSchemas'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
    try {
        console.log(request)
        const body = await request.json()
        const parseResult = CreateUserSchema.safeParse(body)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
        }
        const { email, password } = parseResult.data

        // 이메일 중복 체크
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            throw new BadRequestError(BadRequestErrorMessage.USER_ALREADY_EXISTS)
        }

        // 비밀번호 해싱
        const hashedPassword = await bcryptjs.hash(password, 10)

        // DB에 유저 생성
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: Role.MEMBER,
            },
        })

        return NextResponse.json({ message: 'User created', user }, { status: 201 })
    } catch (error) {
        console.error('User creation error:', error)
        return handleServerError(error)
    }
}
