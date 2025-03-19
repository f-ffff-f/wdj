import LoginForm from '@/components/Auth/Login/Form'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { LoaderCircle } from 'lucide-react'

const Auth = () => {
    const { user, isLoading, isMember, logout } = useAuth()

    if (isLoading)
        return (
            <div className="flex items-center justify-center">
                <LoaderCircle className="animate-spin" />
            </div>
        )

    return (
        <div>
            {isMember ? (
                <div className="flex items-center justify-between">
                    <SidebarGroupLabel>{user?.email || 'Member'}</SidebarGroupLabel>
                    <Button onClick={logout}>Logout</Button>
                </div>
            ) : (
                <LoginForm />
            )}
        </div>
    )
}

export default Auth
