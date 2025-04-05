import { z } from 'zod'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'

export const EmailSchema = z.string().email({ message: BadRequestErrorMessage.INVALID_EMAIL })
export const PasswordSchema = z.string().min(8, { message: BadRequestErrorMessage.INVALID_PASSWORD })

export const CreateUserSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
})

export const GuestSigninSchema = z.object({
    guestUserId: z.string(),
})

export const MemberSigninSchema = z.object({
    email: z.string().email({ message: BadRequestErrorMessage.INVALID_EMAIL }),
    password: z.string().min(8, { message: BadRequestErrorMessage.INVALID_PASSWORD }),
})

export const SigninSchema = z.union([GuestSigninSchema, MemberSigninSchema])
