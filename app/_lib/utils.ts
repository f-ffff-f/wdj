const formatSecondsToMMSS = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export const formatTimeUI = (seconds: number): string => formatSecondsToMMSS(seconds)
