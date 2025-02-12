import Auth from '@/components/AppSidebar/Auth'
import Playlist from '@/components/AppSidebar/Playlist'
import Preference from '@/components/AppSidebar/Preference'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from '@/components/ui/sidebar'

const AppSidebar = () => {
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <Auth />
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
