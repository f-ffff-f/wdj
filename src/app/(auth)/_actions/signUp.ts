import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { handleServerActionError } from '@/lib/server/handleServerActionError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'
import { CreateUserSchema } from '@/lib/shared/validations/userSchemas'
import { Role, User } from '@prisma/client'
import { TServerActionResponse } from '@/lib/shared/types'

export type OmitPasswordUser = Omit<User, 'password'>

export const signUp = async (
    formData: FormData | { email: string; password: string },
): Promise<TServerActionResponse<OmitPasswordUser>> => {
    try {
        // Handle both FormData and direct object input
        const rawData =
            formData instanceof FormData
                ? {
                      email: formData.get('email'),
                      password: formData.get('password'),
                  }
                : formData

        // Validate input data
        const parseResult = CreateUserSchema.safeParse(rawData)
        if (!parseResult.success) {
            throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
        }

        const { email, password } = parseResult.data

        // Check for existing user with same email
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            throw new BadRequestError(BadRequestErrorMessage.USER_ALREADY_EXISTS)
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10)

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: Role.MEMBER,
            },
        })

        // Return user without password
        const { password: _, ...userWithoutPassword } = user
        return { success: true, data: userWithoutPassword }
    } catch (error) {
        return handleServerActionError(error, {
            action: 'signUp',
        })
    }
}
