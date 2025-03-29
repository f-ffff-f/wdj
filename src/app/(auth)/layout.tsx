import { auth } from '@/auth'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    if (session?.user) {
        redirect(`/main/${PLAYLIST_DEFAULT_ID}`)
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-md">{children}</div>
        </div>
    )
}
