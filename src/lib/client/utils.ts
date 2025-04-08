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
