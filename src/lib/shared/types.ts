import { ErrorMessage } from '@/lib/server/error/ErrorMessage'

export type AppResponse<T> = {
    success: boolean
    data?: T
    error?: ErrorMessage
}
