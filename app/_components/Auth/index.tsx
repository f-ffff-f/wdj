import LoginForm from '@/app/_components/Auth/LoginForm'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useCurrentUser } from '@/app/_lib/hooks/useCurrentUser'
import { useLogout } from '@/app/_lib/hooks/useLogout'

const Auth = () => {
    const { data, isLoading, error, isAuthenticated } = useCurrentUser()
    const { logout } = useLogout()

    if (isLoading) return <SidebarGroupLabel>loading...</SidebarGroupLabel>
    if (error) return <SidebarGroupLabel>{error.message}</SidebarGroupLabel>

    return (
        <div>
            {isAuthenticated ? (
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
