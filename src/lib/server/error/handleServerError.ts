import { AppError } from '@/lib/server/error/AppError'

export const handleServerError = (error: unknown): AppError => {
    console.error(error)

    if (error instanceof AppError) {
        return error
    } else {
        // 알 수 없는 에러
        return new AppError()
    }
}
