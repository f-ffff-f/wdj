import { signIn } from '@/auth'
import NewForm from '@/components/Auth/Signin/NewForm'
import { prisma } from '@/lib/shared/prisma'
import { Role } from '@prisma/client'
import { AuthError } from '@auth/core/errors'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

const Signin = () => {
    const handleAction = async (formData: FormData) => {
        'use server'

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

        if (formData.get('userSignin')) {
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
                return { error }
            }
        } else {
            try {
                const guestUser = await prisma.user.create({
                    data: {
                        role: Role.GUEST,
                    },
                })

                const result = await signIn('credentials', {
                    guestUserId: guestUser.id,
                })
                return result
            } catch (error: unknown) {
                return { error }
            }
        }
    }

    return <NewForm action={handleAction} />
}

export default Signin
