import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'
import { AppResponse } from '@/lib/shared/types'

export const handleServerError = (error: unknown): Promise<AppResponse<never>> => {
    console.error(error)

    if (error instanceof AppError) {
        return Promise.reject({
            success: false,
            error: error.message as ErrorMessage,
        })
    } else {
        return Promise.reject({
            success: false,
            error: ErrorMessage.UNKNOWN_ERROR,
        })
    }
}
