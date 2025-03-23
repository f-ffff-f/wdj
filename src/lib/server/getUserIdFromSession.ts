import { auth } from '@/auth'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'

export const getUserIdFromSession = async (): Promise<string> => {
    const session = await auth()

    // Check if user is authenticated
    if (!session?.user?.id) {
        throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
    }

    return session.user.id
}
