import NextAuth, { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/shared/errors/CustomError'
import {
    BadRequestErrorMessage,
    NotFoundErrorMessage,
    UnauthorizedErrorMessage,
} from '@/lib/shared/errors/ErrorMessage'
import { Role } from '@prisma/client'

export const config = {
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
                guestUserId: { label: 'Guest User ID', type: 'text' },
                token: { label: 'Turnstile Token', type: 'text' },
            },
            async authorize(credentials, request) {
                const parsed = SigninSchema.safeParse(credentials)
                if (!parsed.success) {
                    throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
                }

                // Turnstile validation for all users
                const token = parsed.data.token

                // Get the base URL from the request context
                const baseUrl = new URL(request.url || '').origin

                await fetch(`${baseUrl}/api/turnstile`, {
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
        jwt({ token, user }) {
            if (user) {
                // User is available during sign-in
                token.userId = user.id as string
                token.role = user.role as Role
            }
            return token
        },
        session({ session, token }) {
            session.user.id = token.userId
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
    // Secret can be undefined in dev environment with Auth.js v5
    secret: process.env.JWT_SECRET,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
