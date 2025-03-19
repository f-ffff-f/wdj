'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/lib/client/hooks/use-mobile'
import { useAuth } from '@/lib/client/hooks/useAuth'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Shortcuts = dynamic(() => import('@/components/Shortcuts'), { ssr: false })
const AppSidebar = dynamic(() => import('@/components/AppSidebar'), { ssr: false })
const Debugger = dynamic(() => import('@/lib/client/components/Debugger'), { ssr: false })
const DJController = dynamic(() => import('@/components/DJController'), { ssr: false })

const Main = () => {
    const isMobile = useIsMobile()
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push('/')
        }
    }, [user, router])
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

export default Main
