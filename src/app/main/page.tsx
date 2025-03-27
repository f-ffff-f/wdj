import AppSidebar from '@/components/AppSidebar'
import MainView from '@/components/MainView'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

const Main = () => {
    // const isMobile = useIsMobile()

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <div className="flex-1">
                <SidebarTrigger />
                <MainView />
            </div>
        </SidebarProvider>
    )
}

export default Main
