import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { Role } from '@prisma/client'
import { LoaderCircle } from 'lucide-react'

const User = () => {
    const { session, signOutMutation } = useClientAuth()

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
            <Button onClick={() => signOutMutation.mutate()}>Logout</Button>
        </div>
    )
}

export default User
