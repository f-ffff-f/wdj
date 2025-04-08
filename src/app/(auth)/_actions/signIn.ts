'use server'
import { signIn } from '@/auth'
import { prisma } from '@/lib/shared/prisma'
import { GuestSigninSchema, MemberSignSchema } from '@/lib/shared/validations/userSchemas'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { Role } from '@prisma/client'
import { AppError } from '@/lib/server/error/AppError'

const verifyTurnstile = async (formData: FormData) => {
    // Skip verification in test environment
    if (process.env.IS_CI) {
        return
    }

    const formDataTurnstile = new URLSearchParams()
    formDataTurnstile.append('secret', process.env.TURNSTILE_SECRET_KEY || '')
    formDataTurnstile.append('response', formData.get('turnstileToken') as string)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formDataTurnstile,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    const data = await response.json()

    if (!data.success) {
        throw new AppError(ErrorMessage.TURNSTILE_VERIFICATION_FAILED)
    }
}

// Auth.js에서는 리다이렉트 함수(예: redirect() 또는 signIn 내부에서 발생하는 리다이렉트 로직)가 의도적으로 예외(즉, NEXT_REDIRECT)를 던지는데, 이 예외를 catch하면 Next.js가 리다이렉트를 제대로 수행하지 못합니다. 예외적으로 error 객체를 throw 하는 패턴 사용하지 않습니다.
export const signInAction = async (_: { success: boolean; message: string }, formData: FormData) => {
    try {
        await verifyTurnstile(formData)
    } catch (error) {
        return {
            success: false,
            message: ErrorMessage.TURNSTILE_VERIFICATION_FAILED,
        }
    }

    if (formData.get('userSignin')) {
        const result = MemberSignSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        if (!result.success) {
            return {
                success: false,
                message: ErrorMessage.INVALID_INPUT,
            }
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

            return {
                success: false,
                message: ErrorMessage.INVALID_CREDENTIALS,
            }
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
                return {
                    success: false,
                    message: ErrorMessage.INVALID_INPUT,
                }
            }

            await signIn('credentials', {
                guestUserId: guestUser.id,
            })

            return { success: true, message: 'login successful' }
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                throw error
            }

            // unknown error
            return {
                success: false,
                message: ErrorMessage.UNKNOWN_ERROR,
            }
        }
    }
}
