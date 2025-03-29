import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { auth } from '@/auth'
import SignoutButton from '@/components/Auth/User/SignoutButton'

const User = async () => {
    const session = await auth()

    return (
        <div className="flex items-center justify-between">
            <SidebarGroupLabel>{session?.user?.email ? session?.user?.email : 'Guest'}</SidebarGroupLabel>
            <SignoutButton />
        </div>
    )
}

export default User
