import { Prisma } from '@prisma/client'

export type UserDTO = Prisma.UserGetPayload<{
    select: { id: true; email: true; createdAt: true }
}>

export type PlaylistDTO = Prisma.PlaylistGetPayload<{
    select: { id: true; name: true; createdAt: true }
}>
