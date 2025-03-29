import { getTracks } from '@/app/main/actions'
import MainView from '@/components/MainView'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

const MainPage = async () => {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['tracks', null],
        queryFn: () => getTracks(),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MainView />
        </HydrationBoundary>
    )
}

export default MainPage
