'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'

const Shortcuts = dynamic(() => import('@/components/Shortcuts'), { ssr: false })
const AppSidebar = dynamic(() => import('@/components/AppSidebar'), { ssr: false })
const Debugger = dynamic(() => import('@/components/Debugger'), { ssr: false })
const DJController = dynamic(() => import('@/components/DJController'), { ssr: false })

const Home = () => {
    return (
        <QueryClientProvider client={new QueryClient()}>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <div className="flex-1">
                    <SidebarTrigger />

                    <Shortcuts>
                        <DJController />
                        {process.env.NODE_ENV === 'development' && <Debugger />}
                    </Shortcuts>
                </div>
            </SidebarProvider>
        </QueryClientProvider>
    )
}

export default Home
