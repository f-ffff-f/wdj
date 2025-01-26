'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'

const Shortcuts = dynamic(() => import('@/app/_components/Shortcuts'), { ssr: false })
const AppSidebar = dynamic(() => import('@/app/_components/AppSidebar'), { ssr: false })
const Debugger = dynamic(() => import('@/app/_components/Debugger'), { ssr: false })
const DJController = dynamic(() => import('@/app/_components/DJController'), { ssr: false })

const Home = () => {
    return (
        <Shortcuts>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <div className="flex-1">
                    <SidebarTrigger />

                    <DJController />
                    {process.env.NODE_ENV === 'development' && <Debugger />}
                </div>
            </SidebarProvider>
        </Shortcuts>
    )
}

export default Home
