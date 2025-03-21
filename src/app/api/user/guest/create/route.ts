import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { handleServerError } from '@/lib/server/handleServerError'
import { Role } from '@prisma/client'
import { CreateGuestSchema } from '@/lib/shared/validations/userSchemas'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'

export async function POST(request: NextRequest) {
    try {
        // 1. validate the request body
        const body = await request.json()
        const result = CreateGuestSchema.safeParse(body)
        if (!result.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_TURNSTILE_TOKEN)
        }

        // 2. verify the turnstile token
        // This is an internal API call to our own turnstile endpoint
        const { token } = result.data
        await fetch(new URL('/api/turnstile', request.url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })

        // 3. create a guest user after successful verification
        const guestUser = await prisma.user.create({
            data: {
                role: Role.GUEST,
            },
        })

        return NextResponse.json(guestUser)
    } catch (error) {
        console.error('Guest user creation error:', error)
        return handleServerError(error)
    }
}
