// 400 error
export class BadRequestError extends Error {
    status: number
    constructor(message: string) {
        super(message)
        this.name = 'BadRequestError'
        this.status = 400
    }
}

// 401 error
export class UnauthorizedError extends Error {
    status: number
    constructor(message: string) {
        super(message)
        this.name = 'UnauthorizedError'
        this.status = 401
    }
}

// 404 error
export class NotFoundError extends Error {
    status: number
    constructor(message: string) {
        super(message)
        this.name = 'NotFoundError'
        this.status = 404
    }
}
