import LoginForm from '@/app/_components/Auth/LoginForm'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

const Auth = () => {
    const { data, isLoading, error, isAuthenticated, logout } = useCurrentUser()
    if (isLoading) return <SidebarGroupLabel>loading...</SidebarGroupLabel>
    if (error && error.message !== 'Need Authorization') return <SidebarGroupLabel>{error.message}</SidebarGroupLabel>

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
