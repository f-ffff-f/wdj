'use server'

import { signIn } from '@/auth'
import { prisma } from '@/lib/shared/prisma'
import { GuestSigninSchema, MemberSigninSchema } from '@/lib/shared/validations/userSchemas'
import { Role } from '@prisma/client'

export const signInAction = async (formData: FormData) => {
    try {
        // Turnstile validation
        const formDataTurnstile = new URLSearchParams()
        formDataTurnstile.append('secret', process.env.TURNSTILE_SECRET_KEY || '')
        formDataTurnstile.append('response', formData.get('turnstileToken') as string)

        await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formDataTurnstile,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
    } catch (error) {
        throw new Error(error as string)
    }

    // Next.js에서는 리다이렉트 함수(예: redirect() 또는 signIn 내부에서 발생하는 리다이렉트 로직)가 의도적으로 예외(즉, NEXT_REDIRECT)를 던지는데, 이 예외를 catch하면 Next.js가 리다이렉트를 제대로 수행하지 못합니다.
    if (formData.get('userSignin')) {
        const result = MemberSigninSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        if (!result.success) {
            return { error: result.error.issues.map((issue) => issue.message).join(' ') }
        }

        try {
            // Extract the values you need from formData
            const email = formData.get('email') as string
            const password = formData.get('password') as string

            await signIn('credentials', {
                email,
                password,
            })

            return { success: true, message: 'login successful' }
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                throw error
            }
            if (error instanceof Error && error.name === 'CredentialsSignin') {
                return { error: 'email or password is incorrect' }
            }
            return { error }
        }
    } else {
        try {
            const guestUser = await prisma.user.create({
                data: {
                    role: Role.GUEST,
                },
            })

            const result = GuestSigninSchema.safeParse({
                guestUserId: guestUser.id,
            })

            if (!result.success) {
                return { error: result.error.issues.map((issue) => issue.message).join(' ') }
            }

            await signIn('credentials', {
                guestUserId: guestUser.id,
            })

            return { success: true, message: 'login successful' }
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                throw error
            }
            return { error }
        }
    }
}
