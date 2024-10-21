import Profile from '@/app/dashboard/_components/profile'
import Link from 'next/link'
import { Suspense } from 'react'

export default async function Dashboard() {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return (
        <div>
            <Suspense fallback="AVATAR LOADING">
                <Profile />
            </Suspense>
            <Link href="/">Home</Link>
        </div>
    )
}
