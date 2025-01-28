import { Prisma } from '@prisma/client'

export type UserDTO = Prisma.UserGetPayload<{
    select: { id: true; email: true; createdAt: true }
}>
