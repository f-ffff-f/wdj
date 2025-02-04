import LoginForm from '@/app/_components/AppSidebar/Auth/LoginForm'
import { useCurrentUser } from '@/app/_lib/hooks/useCurrentUser'
import { useLogout } from '@/app/_lib/hooks/useLogout'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'

const Auth = () => {
    const { data, isLoading, error, isMember } = useCurrentUser()
    const { logout } = useLogout()

    if (isLoading) return <SidebarGroupLabel>loading...</SidebarGroupLabel>
    if (error && !error.message.includes('Invalid token')) return <SidebarGroupLabel>{error.message}</SidebarGroupLabel>

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
