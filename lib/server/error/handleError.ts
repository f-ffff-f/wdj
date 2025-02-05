import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/server/error/errors'

export const handleError = (error: unknown) => {
    if (error instanceof UnauthorizedError || error instanceof BadRequestError || error instanceof NotFoundError) {
        return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma errors
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Unique constraint failed' }, { status: 400 })
        }
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 })
        }
    }

    if (error instanceof Error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json({ error: 'Unknown Error' }, { status: 500 })
}
