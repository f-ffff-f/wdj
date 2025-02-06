import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/CustomErrors'

export const handleClientError = async (res: Response): Promise<Error> => {
    const errorData = await res.json()

    const error = (() => {
        switch (res.status) {
            case BadRequestError.status:
                return new BadRequestError(errorData?.error || `HTTP error: ${res.status}`)
            case UnauthorizedError.status:
                return new UnauthorizedError(errorData?.error || `HTTP error: ${res.status}`)
            case NotFoundError.status:
                return new NotFoundError(errorData?.error || `HTTP error: ${res.status}`)
            default:
                return new Error(`HTTP error: ${res.status}`)
        }
    })()

    console.error('[API Error]', {
        status: res.status,
        url: res.url,
        error: error.message,
        timestamp: new Date().toISOString(),
    })

    throw error
}
