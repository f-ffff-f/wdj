// Custom message types for each error class
type TBadRequestErrorMessage =
    | 'Invalid track IDs format'
    | 'Invalid playlist name'
    | 'Invalid file name'
    | 'fileName and fileType are required'
    | 'User already exists'

type TUnauthorizedErrorMessage =
    | 'Invalid token'
    | 'No Authorization header provided'
    | 'Token is not exist'
    | 'User not authenticated'
    | 'Invalid credentials'

type TNotFoundErrorMessage =
    | 'User not found'
    | 'Playlist not found'
    | 'Track not found'
    | 'Track not found or unauthorized'

interface ICustomError {
    status: number
    customMessage: string
}
// 400 error
export class BadRequestError extends Error implements ICustomError {
    static status = 400 as const
    status: typeof BadRequestError.status
    customMessage: TBadRequestErrorMessage
    constructor(customMessage: TBadRequestErrorMessage) {
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
    customMessage: TUnauthorizedErrorMessage
    constructor(customMessage: TUnauthorizedErrorMessage) {
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
    customMessage: TNotFoundErrorMessage
    constructor(customMessage: TNotFoundErrorMessage) {
        super(customMessage)
        this.customMessage = customMessage
        this.status = NotFoundError.status
        this.name = 'NotFoundError'
    }
}
