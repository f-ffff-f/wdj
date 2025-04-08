import { getPlaylists } from '@/app/main/_actions/playlist'
import { auth } from '@/auth'
import AppSidebar from '@/app/main/components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/lib/client/components/ui/sidebar'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })

    return (
        <SidebarProvider defaultOpen={true}>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <AppSidebar />
            </HydrationBoundary>
            <SidebarTrigger />
            <div className="flex-1">{children}</div>
        </SidebarProvider>
    )
}

export default MainLayout
