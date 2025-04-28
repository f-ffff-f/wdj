'use client'

import { fetchTracks } from '@/app/main/_fetchers/tracks'
import { Label } from '@/lib/client/components/ui/label'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { uiState } from '@/lib/client/state'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { TDeckId, deckoManager } from '@ghr95223/decko'
import { useQuery } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { useSnapshot } from 'valtio'
import Item from '@/app/main/components/DJController/Library/TrackList/Item'
import Skeleton from '@/app/main/components/DJController/Library/TrackList/Skeleton'
import MyLoader from '@/lib/client/components/utils/MyLoader'
import DropdownTrigger from '@/app/main/components/DJController/Library/TrackList/Item/DropdownTrigger'

const LibraryDropdown = React.lazy(
    () => import('@/app/main/components/DJController/Library/TrackList/Item/LibraryDropdown'),
)
const PlaylistDropdown = React.lazy(
    () => import('@/app/main/components/DJController/Library/TrackList/Item/PlaylistDropdown'),
)

export interface TrackListProps {
    playlistId: string
}

const TrackList = ({ playlistId }: TrackListProps) => {
    const tracks = useQuery({
        queryKey: ['tracks', playlistId],
        queryFn: () => fetchTracks(playlistId),
    })

    const focusedTrackId = useSnapshot(uiState).focusedTrackId
    const { getTrackBlobUrl } = useTrackBlob()

    const handleLoadToDeck = async (deckId: TDeckId, id: string) => {
        const url = await getTrackBlobUrl(id)
        if (url) {
            deckoManager.loadTrack(deckId, url)
        }
    }
    const handleClick = (id: string) => {
        uiState.focusedTrackId = id
    }

    if (tracks.isLoading) {
        return <Skeleton />
    }

    if (!tracks?.data?.length) {
        return <Label>No tracks available</Label>
    }

    if (tracks.error) {
        return <Label>Error: {tracks.error.message}</Label>
    }

    return (
        <div className="max-w-2xl min-h-10 flex flex-col gap-1 overflow-x-hidden" id="track-list">
            {tracks.data?.map((track) => (
                <Item
                    key={track.id}
                    trackId={track.id}
                    fileName={track.fileName}
                    isFocused={focusedTrackId === track.id}
                    handleLoadToDeck={handleLoadToDeck}
                    handleClick={handleClick}
                >
                    {playlistId === PLAYLIST_DEFAULT_ID ? (
                        <DropdownTrigger trackId={track.id}>
                            <Suspense fallback={<MyLoader />}>
                                <LibraryDropdown trackId={track.id} />
                            </Suspense>
                        </DropdownTrigger>
                    ) : (
                        <DropdownTrigger trackId={track.id}>
                            <Suspense fallback={<MyLoader />}>
                                <PlaylistDropdown trackId={track.id} />
                            </Suspense>
                        </DropdownTrigger>
                    )}
                </Item>
            ))}
        </div>
    )
}

export default TrackList
