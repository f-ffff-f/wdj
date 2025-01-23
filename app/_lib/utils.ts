const formatSecondsToMMSS = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export const formatTimeUI = (seconds: number): string => formatSecondsToMMSS(seconds)

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

export const clampGain = (value: number): number => clamp(value, 0, 1)

export const generateTrackId = (fileName: string): string => {
    let hash = 0
    for (let i = 0; i < fileName.length; i++) {
        const char = fileName.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0 // Convert to 32-bit integer
    }
    return Math.abs(hash).toString()
}