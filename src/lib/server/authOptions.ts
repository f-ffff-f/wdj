import { NextAuthOptions } from 'next-auth'
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
                guestUserId: { label: 'Guest User ID', type: 'text' },
                token: { label: 'Turnstile Token', type: 'text' },
            },
            async authorize(credentials) {
                const parsed = SigninSchema.safeParse(credentials)
                if (!parsed.success) {
                    throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
                }

                // 모든 사용자에 대해 Turnstile 검증 수행
                const token = parsed.data.token
                await fetch(`${process.env.NEXTAUTH_URL}/api/turnstile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                })

                // Handle guest authentication
                if ('guestUserId' in parsed.data) {
                    // Use the specific guest ID passed from the client
                    const guestUserId = parsed.data.guestUserId

                    if (!guestUserId) {
                        throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
                    }

                    const guestUser = await prisma.user.findUnique({
                        where: {
                            id: guestUserId,
                            role: Role.GUEST,
                        },
                    })

                    if (!guestUser) {
                        throw new NotFoundError(NotFoundErrorMessage.USER_NOT_FOUND)
                    }

                    return {
                        id: guestUser.id,
                        role: Role.GUEST,
                    }
                } else {
                    // Handle member authentication
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
