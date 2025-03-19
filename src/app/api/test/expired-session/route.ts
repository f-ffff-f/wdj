import { NextResponse } from 'next/server'

/**
 * Test API - Simulates an expired NextAuth session
 * Creates a response that clears the NextAuth session cookie
 */
export async function GET() {
    try {
        // Create a response
        const response = NextResponse.json({
            success: true,
            message: 'Session token was removed to simulate expiration',
        })

        // Clear the session cookie in the response
        response.cookies.delete('next-auth.session-token')

        return response
    } catch (error) {
        console.error('Error simulating session expiration:', error)
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to simulate session expiration',
            },
            {
                status: 500,
            },
        )
    }
}
