import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { LoaderCircle } from 'lucide-react'
import { auth, signOut } from '@/auth'

const User = async () => {
    const session = await auth()

    return (
        <div className="flex items-center justify-between">
            <SidebarGroupLabel>
                {session ? (
                    session?.user?.email ? (
                        session?.user?.email
                    ) : (
                        'Guest'
                    )
                ) : (
                    <LoaderCircle className="animate-spin" />
                )}
            </SidebarGroupLabel>
            <form
                action={async () => {
                    'use server'
                    await signOut()
                }}
            >
                <Button type="submit">Logout</Button>
            </form>
        </div>
    )
}

export default User
