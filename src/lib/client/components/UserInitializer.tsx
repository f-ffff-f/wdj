'use client'

import { useCurrentUser } from '@/lib/client/hooks/useCurrentUser'

export const UserInitializer = () => {
    useCurrentUser()

    return null
}
