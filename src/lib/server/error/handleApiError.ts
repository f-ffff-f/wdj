import { NextResponse } from 'next/server'
import { AppError } from './AppError'
import { ErrorMessage } from './ErrorMessage'
import type { AppResponse } from '@/lib/shared/types'

/**
 * API 라우트 핸들러에서 발생하는 에러를 처리하고 NextResponse를 반환합니다.
 * @param error 발생한 에러 객체
 * @returns 에러 정보를 담은 NextResponse 객체
 */
export const handleApiError = (error: unknown): NextResponse<AppResponse<never>> => {
    console.error('API Route Error:', error) // 서버 로그에 에러 기록

    let errorMessage: ErrorMessage = ErrorMessage.UNKNOWN_ERROR
    let statusCode = 500 // 기본 상태 코드: Internal Server Error

    if (error instanceof AppError) {
        // AppError의 경우, 정의된 메시지와 상태 코드 사용 가능 (AppError 수정 필요)
        errorMessage = error.message as ErrorMessage
        statusCode = error.statusCode // AppError에 statusCode 속성이 있다면 사용
    } else if (error instanceof Error) {
        // 일반 Error 객체의 경우 메시지 사용 시도 (보안상 주의 필요)
        // errorMessage = error.message; // 프로덕션에서는 일반 에러 메시지 노출 삼가
    }

    return NextResponse.json<AppResponse<never>>({ success: false, error: errorMessage }, { status: statusCode })
}

// --- AppError 수정 제안 (선택 사항) ---
// AppError 클래스에 statusCode를 포함하면 더 유용할 수 있습니다.
// export class AppError extends Error {
//   public readonly statusCode: number;
//   constructor(message: string, statusCode: number = 500) {
//     super(message);
//     this.name = 'AppError';
//     this.statusCode = statusCode;
//   }
// }
