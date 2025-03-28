'use server'

import { auth } from '@/auth'

export const getTracksAction = async () => {
    const session = await auth()
}
