import jwt from 'jsonwebtoken'

// 명확한 반환 타입을 위한 커스텀 에러 정의
export class AuthorizationError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message)
        this.name = 'AuthorizationError'
    }
}

export const getUserIdFromToken = (request: Request): { userId: string } => {
    // Authorization 헤더 추출
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
        throw new AuthorizationError(401, 'Need Authorization')
    }

    if (!authHeader.startsWith('Bearer ')) {
        throw new AuthorizationError(401, 'Invalid authorization header format')
    }

    // Bearer 토큰에서 실제 토큰 값 추출
    const token = authHeader.split(' ')[1]
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined')
    }

    // JWT 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string
    }

    return decoded
}

export const formatTimeUI = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
