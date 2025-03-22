import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { UnauthorizedErrorMessage } from '@/lib/shared/errors/ErrorMessage'

export const getUserIdFromRequest = (headersList: Headers): string => {
    const userId = headersList.get('x-user-id')

    if (!userId) {
        throw new UnauthorizedError(UnauthorizedErrorMessage.USER_NOT_AUTHENTICATED)
    }

    return userId
}
