import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token } = body

        if (!token) {
            return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
        }

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

        const result = await response.json()

        if (result.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Verification failed',
                    details: result['error-codes'],
                },
                { status: 400 },
            )
        }
    } catch (error) {
        console.error('Error verifying Turnstile token:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
