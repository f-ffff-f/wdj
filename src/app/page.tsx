'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'
import { useIsMobile } from '@/lib/client/hooks/use-mobile'

const Shortcuts = dynamic(() => import('@/components/Shortcuts'), { ssr: false })
const AppSidebar = dynamic(() => import('@/components/AppSidebar'), { ssr: false })
const Debugger = dynamic(() => import('@/lib/client/components/Debugger'), { ssr: false })
const DJController = dynamic(() => import('@/components/DJController'), { ssr: false })

const Home = () => {
    const isMobile = useIsMobile()
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <div className="flex-1">
                <SidebarTrigger />

                {isMobile ? (
                    <DJController />
                ) : (
                    <Shortcuts>
                        <DJController />
                        {process.env.NODE_ENV === 'development' && <Debugger />}
                    </Shortcuts>
                )}
            </div>
        </SidebarProvider>
    )
}

export default Home
