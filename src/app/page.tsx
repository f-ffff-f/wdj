import Signin from '@/components/Auth/Signin'
import { authOptions } from '@/lib/server/authOptions'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export default async function Home() {
    const session = await getServerSession(authOptions)
    if (session?.user) {
        redirect('/main')
    }
    return <Signin />
}
