import { auth } from '@/auth'
import { AppError } from '@/lib/server/error/AppError'
import { ErrorMessage } from '@/lib/server/error/ErrorMessage'

export const getUserIdFromSession = async (): Promise<string> => {
    const session = await auth()

    // Check if user is authenticated
    if (!session?.user?.id) {
        throw new AppError(ErrorMessage.USER_NOT_FOUND)
    }

    return session.user.id
}
