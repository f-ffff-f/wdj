'use server'

import { prisma } from '@/lib/shared/prisma'
import { TServerActionResponse } from '@/lib/shared/types'
import { CreateUserSchema } from '@/lib/shared/validations/userSchemas'
import { Role, User } from '@prisma/client'
import bcryptjs from 'bcryptjs'

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
            return {
                success: false,
                message: 'Invalid input',
            }
        }

        const { email, password } = parseResult.data

        // Check for existing user with same email
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return {
                success: false,
                message: 'User already exists',
            }
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
        return {
            success: false,
            message: 'unknown error',
        }
    }
}
