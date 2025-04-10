import { getIsValidPlaylist } from '@/app/main/_actions/playlist'
import { getTracks } from '@/app/main/_actions/track'
import DJController from '@/app/main/components/DJController'
import TrackList from '@/app/main/components/DJController/Library/TrackList'
import Debugger from '@/lib/client/components/utils/Debugger'
import Shortcuts from '@/lib/client/components/utils/Shortcuts'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>
}

const PlaylistPage = async ({ params }: Props) => {
    const { playlistId } = await params
    const { isMobileDevice } = await detectMobileDevice()

    const queryClient = new QueryClient()

    const [isValidPlaylist] = await Promise.all([
        (() => {
            return getIsValidPlaylist(playlistId)
        })(),
        queryClient.prefetchQuery({
            queryKey: ['tracks', playlistId],
            queryFn: () => getTracks(playlistId),
        }),
    ])

    if (!isValidPlaylist) {
        notFound()
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {isMobileDevice ? (
                <DJController>
                    <TrackList />
                </DJController>
            ) : (
                <Shortcuts>
                    <DJController>
                        <TrackList />
                    </DJController>
                    {process.env.NODE_ENV === 'development' && <Debugger />}
                </Shortcuts>
            )}
        </HydrationBoundary>
    )
}

export default PlaylistPage
