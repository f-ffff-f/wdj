import React from 'react'

/**
 * 개발 환경에서만 표시되는 환경 표시기 컴포넌트
 * @description process.env.NODE_ENV 값을 기반으로 개발/프로덕션 환경 구분
 */
export const EnvironmentIndicator = () => {
    if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'main') return null

    return (
        <div className="fixed top-2 right-2 z-[9999] flex items-center gap-2">
            <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">DEVELOPMENT</div>
            <div className="rounded-md bg-foreground px-2 py-1 text-xs font-bold text-background">
                {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ? 'preview' : 'local'}
            </div>
        </div>
    )
}
