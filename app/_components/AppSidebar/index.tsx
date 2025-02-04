import Auth from '@/app/_components/AppSidebar/Auth'
import Indicator from '@/app/_components/AppSidebar/Indicator'
import Playlist from '@/app/_components/AppSidebar/Playlist'
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
