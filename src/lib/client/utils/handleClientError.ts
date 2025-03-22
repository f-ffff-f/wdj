import { BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/shared/errors/CustomError'

/**
 * 클라이언트 오류 핸들러
 * @param res - 응답 객체
 * @returns 오류 객체
 * @description customFetcher에서 사용. customFetcher를 사용하지 않는 query는 직접 참조
 */

export const handleClientError = async (res: Response): Promise<Error> => {
    const errorData = await res.json()

    const error = (() => {
        switch (res.status) {
            case BadRequestError.status:
                return new BadRequestError(errorData?.message || `HTTP error: ${res.status}`)
            case UnauthorizedError.status:
                return new UnauthorizedError(errorData?.message || `HTTP error: ${res.status}`)
            case NotFoundError.status:
                return new NotFoundError(errorData?.message || `HTTP error: ${res.status}`)
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
