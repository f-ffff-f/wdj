import { handleServerError } from '@/lib/server/handleServerError'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { NextRequest, NextResponse } from 'next/server'
/** @deprecated */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        // Cloudflare Turnstile API에 토큰 검증 요청
        const formData = new URLSearchParams()
        formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '')
        formData.append('response', token)

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        if (!response.ok) {
            throw new BadRequestError(response.statusText as BadRequestErrorMessage)
        }

        const result = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        return handleServerError(error, { action: 'api/turnstile/POST' })
    }
}
