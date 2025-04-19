import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatPlaybackTimeUI = (seconds: number): string => {
    const absSeconds = Math.abs(seconds)

    const min = Math.floor(absSeconds / 60)
    const sec = Math.floor(absSeconds % 60)
    const ms = Math.floor((absSeconds % 1) * 100)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

export const getBaseUrl = (): string => {
    // 브라우저 환경인지 확인
    if (typeof window !== 'undefined') {
        // 클라이언트에서는 상대 경로 사용 (fetch가 자동으로 현재 도메인 기준 처리)
        return ''
    }

    // 서버 환경
    // 1. 환경 변수 사용 (가장 권장): .env 파일 등에 NEXT_PUBLIC_APP_URL=http://localhost:3000 설정
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL
    }

    // 2. Vercel 환경 변수 (배포 시 자동으로 설정됨)
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    // 3. 로컬 개발 환경 기본값 (포트가 다르면 수정)
    return 'http://localhost:3000'
}
