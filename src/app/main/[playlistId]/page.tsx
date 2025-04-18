import { getIsValidPlaylist } from '@/app/main/_actions/playlist'
import { getTracks } from '@/app/main/_actions/track'
import TrackList from '@/app/main/components/DJController/Library/TrackList'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>
}

const PlaylistPage = async ({ params }: Props) => {
    const { playlistId } = await params

    const queryClient = new QueryClient()

    await Promise.all([
        (() => {
            return getIsValidPlaylist(playlistId)
        })().catch(() => {
            notFound()
        }),
        queryClient.prefetchQuery({
            queryKey: ['tracks', playlistId],
            queryFn: () => getTracks(playlistId),
        }),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TrackList playlistId={playlistId} />
        </HydrationBoundary>
    )
}

export default PlaylistPage
