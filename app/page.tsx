'use client'

import { AppSidebar } from '@/app/_components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'

const Debugger = dynamic(() => import('@/app/_components/Debugger'), { ssr: false })
const Shortcuts = dynamic(() => import('@/app/_components/Shortcuts'), { ssr: false })
const DJController = dynamic(() => import('@/app/_components/DJController'), { ssr: false })

const Home = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <div>
                <SidebarTrigger />

                <Shortcuts>
                    <DJController />
                </Shortcuts>
                {process.env.NODE_ENV === 'development' && <Debugger />}
            </div>
        </SidebarProvider>
    )
}

export default Home
