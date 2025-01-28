import jwt from 'jsonwebtoken'

type TokenPayload = {
    userId: string
}

export const getUserIdFromToken = (request: Request): string => {
    // 1. Authorization 헤더 추출
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
        throw new Error('NEED_AUTHORIZATION')
    }

    // 2. Bearer 토큰 파싱
    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !token) {
        throw new Error('INVALID_AUTH_FORMAT')
    }

    // 3. 환경변수 검증
    if (!process.env.JWT_SECRET) {
        throw new Error('SERVER_CONFIG_ERROR')
    }

    // 4. 토큰 검증
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload
        return decoded.userId
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('TOKEN_EXPIRED')
        }
        throw new Error('INVALID_TOKEN')
    }
}
