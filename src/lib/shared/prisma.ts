import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // log: ['query', 'info', 'warn', 'error'], // 필요시 로깅
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
