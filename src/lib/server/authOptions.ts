import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { Role } from '@prisma/client'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import {
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
} from '@/lib/shared/errors/ErrorMessage'

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = SigninSchema.safeParse(credentials)
                if (!parsed.success) {
                    throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
                }

                // Handle guest authentication
                if (parsed.data.email === '' && parsed.data.password === '') {
                    const guestUser = await prisma.user.create({
                        data: {
                            email: null,
                            password: null,
                            role: Role.GUEST,
                        },
                    })

                    return {
                        id: guestUser.id,
                        role: Role.GUEST,
                        email: null,
                    }
                }

                // Handle regular user authentication
                const user = await prisma.user.findUnique({
                    where: { email: parsed.data.email },
                })

                if (!user || !user.password) {
                    throw new NotFoundError(NotFoundErrorMessage.USER_NOT_FOUND)
                }

                const isPasswordValid = await bcryptjs.compare(parsed.data.password, user.password)
                if (!isPasswordValid) {
                    throw new UnauthorizedError(UnauthorizedErrorMessage.INVALID_CREDENTIALS)
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add role to token when user signs in
            if (user) {
                token.userId = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            // Add role and userId to session
            if (token && session.user) {
                session.user.role = token.role as Role
                session.user.id = token.userId
            }
            return session
        },
    },
    pages: {
        signIn: '/',
    },
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.JWT_SECRET,
}
