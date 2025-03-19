import { z } from 'zod'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'

export const EmailSchema = z.string().email({ message: BadRequestErrorMessage.INVALID_EMAIL })
export const PasswordSchema = z.string().min(8, { message: BadRequestErrorMessage.INVALID_PASSWORD })

export const CreateUserSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
})

const GuestLoginSchema = z.object({
    email: z.literal(''),
    password: z.literal(''),
})
const RegularLoginSchema = z.object({
    email: z.string().email({ message: BadRequestErrorMessage.INVALID_EMAIL }),
    password: z.string().min(8, { message: BadRequestErrorMessage.INVALID_PASSWORD }),
})

export const LoginSchema = z.union([GuestLoginSchema, RegularLoginSchema])
