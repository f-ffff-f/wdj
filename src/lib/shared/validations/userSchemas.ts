import { z } from 'zod'

export const EmailSchema = z.string().email({ message: 'Invalid email' })
export const PasswordSchema = z.string().min(8, { message: 'Invalid password' })

export const GuestSigninSchema = z.object({
    guestUserId: z.string(),
})

export const MemberSignSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
})

export const SigninSchema = z.union([GuestSigninSchema, MemberSignSchema])
