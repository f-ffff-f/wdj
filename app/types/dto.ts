import { Prisma } from '@prisma/client'

export type UserDTO = Prisma.UserGetPayload<{
    select: { id: true; email: true; createdAt: true; role: true }
}>

export type PlaylistDTO = Prisma.PlaylistGetPayload<{
    select: { id: true; name: true; createdAt: true; tracks: { select: { id: true } } }
}>

export type TrackDTO = Prisma.TrackGetPayload<{
    select: { id: true; fileName: true; url: true; createdAt: true }
}>
