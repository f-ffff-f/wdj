// src/app/main/layout.tsx
import AppSidebar from '@/app/main/components/AppSidebar'
import DJController from '@/app/main/components/DJController'
import { auth } from '@/auth'
import { SidebarProvider, SidebarTrigger } from '@/lib/client/components/ui/sidebar'
import Shortcuts from '@/lib/client/components/utils/Shortcuts'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import { redirect } from 'next/navigation'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const [session, { isMobileDevice }] = await Promise.all([auth(), detectMobileDevice()])

    if (!session) {
        redirect('/')
    }

    const renderConditional = () => {
        return isMobileDevice ? (
            <DJController>{children}</DJController>
        ) : (
            <Shortcuts>
                <DJController>{children}</DJController>
            </Shortcuts>
        )
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <div className="flex-1">
                <SidebarTrigger />
                {renderConditional()}
            </div>
        </SidebarProvider>
    )
}

export default MainLayout
