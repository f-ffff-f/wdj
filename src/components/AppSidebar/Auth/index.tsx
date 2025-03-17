import LoginForm from '@/components/AppSidebar/Auth/LoginForm'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useCurrentUser } from '@/lib/client/hooks/useCurrentUser'
import { useLogout } from '@/lib/client/hooks/useLogout'
import { LoaderCircle } from 'lucide-react'

const Auth = () => {
    const { data, error, isLoading, isMember } = useCurrentUser()
    const { logout } = useLogout()

    if (isLoading)
        return (
            <div className="flex items-center justify-center">
                <LoaderCircle className="animate-spin" />
            </div>
        )

    if (error) return <SidebarGroupLabel>{error.message}</SidebarGroupLabel>

    return (
        <div>
            {isMember ? (
                <div className="flex items-center justify-between">
                    <SidebarGroupLabel>{data?.email}</SidebarGroupLabel>
                    <Button onClick={logout}>Logout</Button>
                </div>
            ) : (
                <LoginForm />
            )}
        </div>
    )
}

export default Auth
