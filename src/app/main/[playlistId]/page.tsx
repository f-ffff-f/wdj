import { getIsValidPlaylist } from '@/app/main/_actions/playlist'
import { getTracks } from '@/app/main/_actions/track'
import DJController from '@/app/main/components/DJController'
import TrackList from '@/app/main/components/DJController/Library/TrackList'
import Debugger from '@/lib/client/components/utils/Debugger'
import Shortcuts from '@/lib/client/components/utils/Shortcuts'
import WindowCheck from '@/lib/client/components/utils/WindowCheck'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import React from 'react'

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
    ]).then(() => {
        console.log('prefetch done')
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <TrackList playlistId={playlistId} />
        </HydrationBoundary>
    )
}

export default PlaylistPage
