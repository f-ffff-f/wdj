import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { Role } from '@prisma/client'
import { LoginSchema } from '@/lib/shared/validations/userSchemas'
import { BadRequestError } from '@/lib/shared/errors/CustomError'
import { BadRequestErrorMessage } from '@/lib/shared/errors/ErrorMessage'

const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = LoginSchema.safeParse(credentials)
                if (!parsed.success) {
                    throw new BadRequestError(BadRequestErrorMessage.INVALID_INPUT)
                }

                // Handle guest authentication
                if (
                    parsed.data.email === process.env.GUEST_EMAIL &&
                    parsed.data.password === process.env.GUEST_PASSWORD
                ) {
                    const guestUser = await prisma.user.create({
                        data: {
                            role: Role.GUEST,
                            email: null,
                            password: null,
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
                    return null
                }

                const isPasswordValid = await bcryptjs.compare(parsed.data.password, user.password)
                if (!isPasswordValid) {
                    return null
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

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
