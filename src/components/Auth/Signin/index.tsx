import SigninForm from '@/components/Auth/Signin/Form'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { LoaderCircle } from 'lucide-react'

const Signin = () => {
    const { user, isLoading, signOut } = useAuth()

    if (isLoading)
        return (
            <div className="flex items-center justify-center">
                <LoaderCircle className="animate-spin" />
            </div>
        )

    return (
        <div>
            {user ? (
                <div className="flex items-center justify-between">
                    <SidebarGroupLabel>{user?.email || 'Guest'}</SidebarGroupLabel>
                    <Button onClick={signOut}>Logout</Button>
                </div>
            ) : (
                <SigninForm />
            )}
        </div>
    )
}

export default Signin
