import { getPlaylists } from '@/app/main/actions'
import { auth } from '@/auth'
import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

const PlaylistPage = async ({ children }: { children: React.ReactNode }) => {
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
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarTrigger />
                <div className="flex-1">{children}</div>
            </SidebarProvider>
        </HydrationBoundary>
    )
}

export default PlaylistPage
