import AppSidebar from '@/components/AppSidebar'
import MainView from '@/components/MainView'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { QueryClient } from '@tanstack/react-query'
import { auth } from '@/auth'
const Main = async () => {
    const queryClient = new QueryClient()
    const session = await auth()

    // await queryClient.prefetchQuery({
    //     queryKey: ['posts'],
    //     queryFn: getPosts,
    // })
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
