import { auth } from '@/auth'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { redirect } from 'next/navigation'

export default async function Redirect() {
    const session = await auth()
    if (session?.user) {
        redirect(`/main/${PLAYLIST_DEFAULT_ID}`)
    }
}
