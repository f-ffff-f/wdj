import {
    BadRequestErrorMessage,
    UnauthorizedErrorMessage,
    NotFoundErrorMessage,
} from '@/lib/shared/errors/ErrorMessage'

interface ICustomError {
    status: number
    customMessage: string
}
// 400 error
export class BadRequestError extends Error implements ICustomError {
    static status = 400 as const
    status: typeof BadRequestError.status
    customMessage: BadRequestErrorMessage
    constructor(customMessage: BadRequestErrorMessage) {
        super(customMessage)
        this.customMessage = customMessage
        this.status = BadRequestError.status
        this.name = 'BadRequestError'
    }
}

// 401 error
export class UnauthorizedError extends Error implements ICustomError {
    static status = 401 as const
    status: typeof UnauthorizedError.status
    customMessage: UnauthorizedErrorMessage
    constructor(customMessage: UnauthorizedErrorMessage) {
        super(customMessage)
        this.customMessage = customMessage
        this.status = UnauthorizedError.status
        this.name = 'UnauthorizedError'
    }
}

// 404 error
export class NotFoundError extends Error implements ICustomError {
    static status = 404 as const
    status: typeof NotFoundError.status
    customMessage: NotFoundErrorMessage
    constructor(customMessage: NotFoundErrorMessage) {
        super(customMessage)
        this.customMessage = customMessage
        this.status = NotFoundError.status
        this.name = 'NotFoundError'
    }
}
