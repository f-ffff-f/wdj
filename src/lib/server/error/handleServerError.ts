import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'

export const handleServerError = (error: unknown) => {
    console.error(error)

    if (error instanceof AppError) {
        throw error
    } else {
        throw new Error(ErrorMessage.UNKNOWN_ERROR)
    }
}
