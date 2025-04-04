export type TServerActionResponse<T> = {
    success: boolean
    data?: T
    message?: string
}
