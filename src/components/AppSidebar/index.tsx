import Auth from '@/components/AppSidebar/Auth'
import Indicator from '@/components/AppSidebar/Indicator'
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
                    <Indicator />
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
