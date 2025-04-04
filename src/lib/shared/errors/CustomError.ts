import {
    BadRequestErrorMessage,
    UnauthorizedErrorMessage,
    NotFoundErrorMessage,
} from '@/lib/shared/errors/ErrorMessage'

interface ICustomError {
    status: number
    errorCode: string
    message: string
}
// 400 error
/** @deprecated */
export class BadRequestError extends Error implements ICustomError {
    static status = 400 as const
    static errorCode = 'BAD_REQUEST' as const
    status: typeof BadRequestError.status
    errorCode: typeof BadRequestError.errorCode
    message: BadRequestErrorMessage
    constructor(message: BadRequestErrorMessage) {
        super(message)
        this.name = 'BadRequestError'
        this.status = BadRequestError.status
        this.errorCode = BadRequestError.errorCode
        this.message = message
    }
}

// 401 error
/** @deprecated */
export class UnauthorizedError extends Error implements ICustomError {
    static status = 401 as const
    static errorCode = 'UNAUTHORIZED' as const
    status: typeof UnauthorizedError.status
    errorCode: typeof UnauthorizedError.errorCode
    message: UnauthorizedErrorMessage
    constructor(message: UnauthorizedErrorMessage) {
        super(message)
        this.name = 'UnauthorizedError'
        this.status = UnauthorizedError.status
        this.errorCode = UnauthorizedError.errorCode
        this.message = message
    }
}

// 404 error
/** @deprecated */
export class NotFoundError extends Error implements ICustomError {
    static status = 404 as const
    static errorCode = 'NOT_FOUND' as const
    status: typeof NotFoundError.status
    errorCode: typeof NotFoundError.errorCode
    message: NotFoundErrorMessage
    constructor(message: NotFoundErrorMessage) {
        super(message)
        this.name = 'NotFoundError'
        this.status = NotFoundError.status
        this.errorCode = NotFoundError.errorCode
        this.message = message
    }
}
