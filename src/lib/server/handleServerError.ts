import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { ZodError } from 'zod'

export const handleServerError = (
    error: unknown,
    option?: {
        userId?: string
        action?: string
    },
) => {
    // Default error values
    let status = 500
    let errorCode = 'INTERNAL_SERVER_ERROR'
    let message = 'Internal Server Error'

    // Handle custom errors
    if (error instanceof UnauthorizedError || error instanceof BadRequestError || error instanceof NotFoundError) {
        status = error.status
        errorCode = error.errorCode
        message = error.message
    } else if (error instanceof ZodError) {
        status = 400
        errorCode = 'INVALID_INPUT'
        message = error.errors.map((e) => e.message).join(', ')
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma errors
        if (error.code === 'P2002') {
            status = 400
            errorCode = 'UNIQUE_CONSTRAINT_FAILED'
            message = 'Unique constraint failed'
        } else if (error.code === 'P2025') {
            status = 404
            errorCode = 'RECORD_NOT_FOUND'
            message = 'Record not found'
        }
    } else if (error instanceof Error) {
        status = status
        errorCode = errorCode
        message = message
    } else {
        message = 'Unknown Error'
        errorCode = 'UNKNOWN_ERROR'
    }

    // Log the error with context information
    console.error('[handleServerError]', {
        action: option?.action,
        userId: option?.userId,
        errorCode,
        message,
        error,
    })

    // Return consistent response format
    return NextResponse.json(
        {
            success: false,
            errorCode,
            message,
        },
        { status },
    )
}
