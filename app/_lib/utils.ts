export const getEnv = (key: string): string => {
    const value = process.env[key]
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value
}

export const formatTimeUI = (seconds: number): string => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
