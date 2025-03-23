import { Role } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
    /**
     * Extend the built-in session types
     */
    interface Session {
        user: {
            id: string
            role: Role
        } & DefaultSession['user']
    }

    /**
     * Extend the built-in user types
     */
    interface User extends DefaultUser {
        id: string
        role: Role
    }
}

import { JWT } from 'next-auth/jwt'

declare module 'next-auth/jwt' {
    /**
     * Extend the built-in JWT types
     */
    interface JWT {
        userId: string
        role: Role
    }
}
