import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { LoaderCircle } from 'lucide-react'

const User = () => {
    const { user, isLoading, signOut } = useAuth()

    return (
        <div className="flex items-center justify-between">
            <SidebarGroupLabel>{isLoading ? <LoaderCircle className="animate-spin" /> : user?.role}</SidebarGroupLabel>
            <Button onClick={signOut}>Logout</Button>
        </div>
    )
}

export default User
