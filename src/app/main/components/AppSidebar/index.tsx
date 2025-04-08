import Playlist from '@/app/main/components/AppSidebar/Playlists'
import Preference from '@/app/main/components/AppSidebar/Preference'
import User from '@/app/main/components/AppSidebar/User'
import { Separator } from '@/lib/client/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from '@/lib/client/components/ui/sidebar'

const AppSidebar = () => {
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <User />
                </SidebarGroup>
                <Separator />
                <SidebarGroup>
                    <Playlist />
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
