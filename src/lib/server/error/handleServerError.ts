import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'

/** @important 최종 소비자는 try catch 문 안에서 사용해야 한다. */
export const handleServerError = (error: unknown): never => {
    console.error(error)

    if (error instanceof AppError) {
        throw error
    } else {
        throw new Error(ErrorMessage.UNKNOWN_ERROR)
    }
}
