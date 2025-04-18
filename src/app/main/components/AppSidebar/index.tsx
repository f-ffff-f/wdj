import { getPlaylists } from '@/app/main/_actions/playlist'
import Playlist from '@/app/main/components/AppSidebar/Playlists'
import Preference from '@/app/main/components/AppSidebar/Preference'
import User from '@/app/main/components/AppSidebar/User'
import { Separator } from '@/lib/client/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from '@/lib/client/components/ui/sidebar'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const AppSidebar = async () => {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <User />
                </SidebarGroup>
                <Separator />
                <SidebarGroup>
                    <HydrationBoundary state={dehydrate(queryClient)}>
                        <Playlist />
                    </HydrationBoundary>
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter className="flex">
                <Preference />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar
