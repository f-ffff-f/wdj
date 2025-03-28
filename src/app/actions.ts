'use server'

import { signIn } from '@/auth'
import { handleServerActionError } from '@/lib/server/handleServerError'
import { BadRequestError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage, UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { prisma } from '@/lib/shared/prisma'
import { GuestSigninSchema, MemberSigninSchema } from '@/lib/shared/validations/userSchemas'
import { Role } from '@prisma/client'

export const signInAction = async (_: { success: boolean; message: string }, formData: FormData) => {
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
        // unknown error
        return handleServerActionError(error, { userId: null, action: 'actions/signInAction' })
    }

    // Next.js에서는 리다이렉트 함수(예: redirect() 또는 signIn 내부에서 발생하는 리다이렉트 로직)가 의도적으로 예외(즉, NEXT_REDIRECT)를 던지는데, 이 예외를 catch하면 Next.js가 리다이렉트를 제대로 수행하지 못합니다.
    if (formData.get('userSignin')) {
        const result = MemberSigninSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        if (!result.success) {
            return handleServerActionError(new BadRequestError(BadRequestErrorMessage.INVALID_INPUT), {
                userId: null,
                action: 'actions/signInAction',
            })
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

            return handleServerActionError(new UnauthorizedError(UnauthorizedErrorMessage.INVALID_CREDENTIALS), {
                userId: null,
                action: 'actions/signInAction',
            })
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
                return handleServerActionError(new BadRequestError(BadRequestErrorMessage.INVALID_INPUT), {
                    userId: null,
                    action: 'actions/signInAction',
                })
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
            return handleServerActionError(new UnauthorizedError(UnauthorizedErrorMessage.INVALID_GUEST_USER_ID), {
                userId: null,
                action: 'actions/signInAction',
            })
        }
    }
}
