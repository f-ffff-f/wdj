import jwt from 'jsonwebtoken'

export const getUserIdFromToken = (request: Request): { userId: string } => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined')
    }

    // Authorization 헤더 추출
    const authHeader = request.headers.get('Authorization')

    // Bearer 토큰에서 실제 토큰 값 추출
    const token = authHeader!.split(' ')[1]

    // JWT 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string
    }

    return decoded
}
