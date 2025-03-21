import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/shared/prisma'
import { handleServerError } from '@/lib/server/handleServerError'
import { Role } from '@prisma/client'
import { CreateGuestSchema } from '@/lib/shared/validations/userSchemas'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = CreateGuestSchema.parse(body)

        if (!token) {
            return NextResponse.json({ error: 'Missing turnstile token' }, { status: 400 })
        }

        // Reuse the existing turnstile verification endpoint
        // This is an internal API call to our own turnstile endpoint
        const verifyResponse = await fetch(new URL('/api/turnstile', request.url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })

        const verifyResult = await verifyResponse.json()

        if (!verifyResult.success) {
            return NextResponse.json(
                {
                    error: 'Verification failed',
                    details: verifyResult.details || 'Turnstile verification failed',
                },
                { status: 400 },
            )
        }

        // Create a guest user after successful verification
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
