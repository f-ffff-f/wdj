'use client'

import { getPlaylists } from '@/app/main/_actions/playlist'
import { getTracks } from '@/app/main/_actions/track'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { SidebarMenuAction } from '@/components/ui/sidebar'
import { DECK_IDS, TDeckId } from '@/lib/client/deck'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { state } from '@/lib/client/state'
import { cn } from '@/lib/client/utils'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { deckoSingleton } from '@ghr95223/decko'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpCircle, MoreVertical } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useSnapshot } from 'valtio'

const TrackList = () => {
    const { playlistId: playlistIdParam } = useParams<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>()

    const {
        data: tracks,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tracks', playlistIdParam],
        queryFn: () => getTracks(playlistIdParam),
    })

    const focusedTrackId = useSnapshot(state).UI.focusedTrackId
    const { getTrackBlobUrl } = useTrackBlob()

    const handleLoadToDeck = async (deckId: TDeckId, id: string) => {
        const url = await getTrackBlobUrl(id)
        deckoSingleton.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.UI.focusedTrackId = id
    }

    if (isLoading) {
        return <Label>Loading tracks...</Label>
    }

    if (error) {
        return <Label>Error: {error.message}</Label>
    }

    if (!tracks?.data) {
        return <Label>No tracks available</Label>
    }

    return (
        <div className="max-w-2xl min-h-10 flex flex-col gap-1 overflow-x-hidden" id="track-list">
            {tracks?.data?.map((track) => (
                <Item
                    key={track.id}
                    trackId={track.id}
                    fileName={track.fileName}
                    isFocused={focusedTrackId === track.id}
                    handleLoadToDeck={handleLoadToDeck}
                    handleClick={handleClick}
                >
                    {playlistIdParam === PLAYLIST_DEFAULT_ID ? (
                        <LibraryDropdownMenu trackId={track.id} />
                    ) : (
                        <PlaylistDropdownMenu trackId={track.id} />
                    )}
                </Item>
            ))}
        </div>
    )
}

interface ITrackListItemProps {
    trackId: string
    fileName: string
    isFocused: boolean
    handleLoadToDeck: (deckId: TDeckId, url: string) => void
    handleClick: (id: string) => void
    children: React.ReactNode
}

const Item: React.FC<ITrackListItemProps> = ({
    trackId,
    fileName,
    isFocused,
    handleLoadToDeck,
    handleClick,
    children,
}) => {
    return (
        <div className="flex" data-trackid={trackId}>
            <Card
                className={cn(
                    'w-full relative flex items-center justify-between p-4 pr-6 shadow-none',
                    isFocused && 'shadow-[inset_0_0_12px_1px] shadow-primary',
                )}
                onClick={() => handleClick(trackId)}
            >
                <Button onClick={() => handleLoadToDeck(DECK_IDS.ID_1, trackId)}>
                    <ArrowUpCircle />
                </Button>
                <MarqueeText text={fileName} />
                <Button onClick={() => handleLoadToDeck(DECK_IDS.ID_2, trackId)}>
                    <ArrowUpCircle />
                </Button>
                {children}
            </Card>
        </div>
    )
}

const MarqueeText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLSpanElement>(null)
    const [shouldScroll, setShouldScroll] = useState(false)

    useEffect(() => {
        if (containerRef.current && textRef.current) {
            const textWidth = textRef.current.scrollWidth
            const containerWidth = containerRef.current.clientWidth
            setShouldScroll(textWidth > containerWidth)
        }
    }, [text])

    return (
        <div ref={containerRef} className="w-[200px] md:w-[300px] overflow-hidden text-center">
            {shouldScroll ? (
                <Marquee gradient={false} speed={50} pauseOnHover>
                    <span ref={textRef} className="mx-8">
                        {text}
                    </span>
                    <span className="mx-10">{text}</span>
                </Marquee>
            ) : (
                <span ref={textRef} className="block truncate">
                    {text}
                </span>
            )}
        </div>
    )
}

/** @TODO */
const LibraryDropdownMenu = ({ trackId }: { trackId: string }) => {
    const { data: playlists } = useQuery({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })
    const { deleteTrackMutation } = useTrackMutation()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction data-testid={`dropdown-trigger-${trackId}`}>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center" data-testid={`dropdown-content-${trackId}`}>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <span>Add to Playlist</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {playlists?.data?.map((playlist) => (
                            <DropdownMenuItem
                                key={playlist.id}
                                onClick={() => {
                                    // createTrackMutation.mutate({ id: playlist.id, trackIds: [trackId] })
                                }}
                            >
                                <span>{playlist.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                    data-testid={`dropdown-item-delete-${trackId}`}
                    onClick={() => deleteTrackMutation.mutate(trackId)}
                >
                    <span>Delete Track from Library</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/** @TODO */
const PlaylistDropdownMenu = ({ trackId }: { trackId: string }) => {
    // const { deleteTracksFromPlaylistMutation } = usePlaylistMutation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem
                // onClick={() =>
                // deleteTracksFromPlaylistMutation.mutate([trackId])
                // }
                >
                    <span>Delete Track from Playlist</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TrackList
