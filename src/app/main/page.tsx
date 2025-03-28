import AppSidebar from '@/components/AppSidebar'
import MainView from '@/components/MainView'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPlaylists, getTracks } from '@/app/main/actions'

const Main = async () => {
    const session = await auth()

    if (!session) {
        redirect('/')
    }

    const queryClient = new QueryClient()

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['tracks'],
            queryFn: getTracks,
        }),
        queryClient.prefetchQuery({
            queryKey: ['playlists'],
            queryFn: getPlaylists,
        }),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarTrigger />
                <div className="flex-1">
                    <MainView />
                </div>
            </SidebarProvider>
        </HydrationBoundary>
    )
}

export default Main
