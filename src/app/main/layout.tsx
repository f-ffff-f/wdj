import AppSidebar from '@/app/main/components/AppSidebar'
import { auth } from '@/auth'
import { SidebarProvider, SidebarTrigger } from '@/lib/client/components/ui/sidebar'
import { redirect } from 'next/navigation'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarTrigger />
            <div className="flex-1">{children}</div>
        </SidebarProvider>
    )
}

export default MainLayout
