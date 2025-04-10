import { ErrorMessage } from '@/lib/server/error/ErrorMessage'

export class AppError extends Error {
    constructor(message: ErrorMessage) {
        super(message)
    }
}
