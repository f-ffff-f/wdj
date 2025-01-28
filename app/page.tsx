'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import dynamic from 'next/dynamic'
import { fetcher } from '@/app/_lib/fetcher'

const Shortcuts = dynamic(() => import('@/app/_components/Shortcuts'), { ssr: false })
const AppSidebar = dynamic(() => import('@/app/_components/AppSidebar'), { ssr: false })
const Debugger = dynamic(() => import('@/app/_components/Debugger'), { ssr: false })
const DJController = dynamic(() => import('@/app/_components/DJController'), { ssr: false })

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: async ({ queryKey }) => {
                const url = queryKey[0] as string // queryKey의 첫 번째 요소는 URL로 사용
                return fetcher(url)
            },
            retry: false, // 인증 관련 요청은 재시도 비활성화
        },
    },
})

const Home = () => {
    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    )
}

export default Home
