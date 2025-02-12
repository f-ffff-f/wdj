import Auth from '@/components/AppSidebar/Auth'
import StorageIndicator from '@/components/AppSidebar/StorageIndicator'
import Playlist from '@/components/AppSidebar/Playlist'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarGroup } from '@/components/ui/sidebar'

const AppSidebar = () => {
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <Auth />
                </SidebarGroup>
                <Separator />
                <SidebarGroup>
                    <StorageIndicator />
                </SidebarGroup>
                <Separator />
                <SidebarGroup>
                    <Playlist />
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar
