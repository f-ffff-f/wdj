import { auth } from '@/auth'

export const getUserIdFromSession = async (): Promise<string> => {
    const session = await auth()

    // Check if user is authenticated
    if (!session?.user?.id) {
        throw new Error('User not authenticated')
    }

    return session.user.id
}
