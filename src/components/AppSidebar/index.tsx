import Playlist from '@/components/AppSidebar/Playlist'
import Preference from '@/components/AppSidebar/Preference'
import User from '@/components/AppSidebar/User'
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup } from '@/components/ui/sidebar'

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
