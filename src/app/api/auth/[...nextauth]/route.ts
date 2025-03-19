import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/shared/prisma'
import bcryptjs from 'bcryptjs'
import { Role } from '@prisma/client'

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
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Handle guest authentication
                if (credentials.email === 'guest' && credentials.password === 'guest') {
                    // Create a new guest user
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

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })

                // Check if user exists and validate password
                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await bcryptjs.compare(credentials.password, user.password)

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
