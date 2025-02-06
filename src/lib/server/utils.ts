export const getUserIdFromRequest = (headersList: Headers): string | null => {
    const userId = headersList.get('x-user-id')

    return userId
}

export const getEnv = (key: string): string => {
    const value = process.env[key]
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value
}

export const generateS3FileKey = (userId: string, id: string): `uploads/${string}/${string}` => {
    return `uploads/${userId}/${id}`
}
