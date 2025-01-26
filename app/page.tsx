'use client'

import { AppSidebar } from '@/app/_components/AppSidebar'
import Shortcuts from '@/app/_components/Shortcuts'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'

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
