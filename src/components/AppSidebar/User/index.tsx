import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { Role } from '@prisma/client'
import { LoaderCircle } from 'lucide-react'

const User = () => {
    const { session, signOutMutation } = useAuth()

    return (
        <div className="flex items-center justify-between">
            <SidebarGroupLabel>
                {session ? (
                    session?.user?.role === Role.MEMBER ? (
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
