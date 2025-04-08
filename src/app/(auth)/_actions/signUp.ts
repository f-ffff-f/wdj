'use server'

import { prisma } from '@/lib/shared/prisma'
import { MemberSignSchema } from '@/lib/shared/validations/userSchemas'
import { Role, User } from '@prisma/client'
import bcryptjs from 'bcryptjs'

export type OmitPasswordUser = Omit<User, 'password'>

export const signUp = async (formData: FormData | { email: string; password: string }): Promise<OmitPasswordUser> => {
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
        const parseResult = MemberSignSchema.safeParse(rawData)
        if (!parseResult.success) {
            throw new Error('Invalid input')
        }

        const { email, password } = parseResult.data

        // Check for existing user with same email
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            throw new Error('User already exists')
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
        return userWithoutPassword
    } catch (error) {
        throw new Error('unknown error')
    }
}
