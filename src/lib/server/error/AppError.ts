// --- AppError 수정 제안 (선택 사항) ---
// AppError 클래스에 statusCode를 포함하면 더 유용할 수 있습니다.
export class AppError extends Error {
    public readonly statusCode: number
    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = 'AppError'
        this.statusCode = statusCode
    }
}
