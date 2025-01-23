export const generateTrackId = (fileName: string): string => {
    let hash = 0
    for (let i = 0; i < fileName.length; i++) {
        const char = fileName.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash |= 0 // Convert to 32-bit integer
    }
    return Math.abs(hash).toString()
}
