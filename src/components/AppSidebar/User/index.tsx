import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { Role } from '@prisma/client'
import { LoaderCircle } from 'lucide-react'

const User = () => {
    const { user, signOut } = useAuth()

    return (
        <div className="flex items-center justify-between">
            <SidebarGroupLabel>
                {user ? user?.role === Role.MEMBER ? user.email : 'Guest' : <LoaderCircle className="animate-spin" />}
            </SidebarGroupLabel>
            <Button onClick={signOut}>Logout</Button>
        </div>
    )
}

export default User
