import { getPlaylists, getTracks } from '@/app/main/actions'
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
import { SidebarMenuAction } from '@/components/ui/sidebar'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { state } from '@/lib/client/state'
import { cn } from '@/lib/client/utils'
import { deckoSingleton, EDeckIds } from '@ghr95223/decko'
import { Playlist, Track } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpCircle, MoreVertical } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Marquee from 'react-fast-marquee'
import { useSnapshot } from 'valtio'

const List = () => {
    const { playlistId } = useParams<{ playlistId: string }>()

    const tracksQuery = useQuery<Track[]>({
        queryKey: ['tracks', playlistId],
        queryFn: () => getTracks(playlistId),
    })

    const focusedTrackId = useSnapshot(state).UI.focusedTrackId
    const { getTrackBlobUrl } = useTrackBlob()

    const handleLoadToDeck = async (deckId: EDeckIds, id: string) => {
        const url = await getTrackBlobUrl(id)
        deckoSingleton.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.UI.focusedTrackId = id
    }

    if (tracksQuery?.error) {
        return <div>Error: {tracksQuery.error.message}</div>
    }

    if (tracksQuery.isLoading) {
        return <div>Loading tracks...</div>
    }

    if (!tracksQuery.data || tracksQuery.data.length === 0) {
        return <div>No tracks available</div>
    }

    return (
        <div className="max-w-2xl min-h-10 flex flex-col gap-1 overflow-x-hidden" id="track-list">
            {tracksQuery.data.map((track) => (
                <Item
                    key={track.id}
                    trackId={track.id}
                    fileName={track.fileName}
                    isFocused={focusedTrackId === track.id}
                    handleLoadToDeck={handleLoadToDeck}
                    handleClick={handleClick}
                >
                    {playlistId === 'library' ? (
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
    handleLoadToDeck: (deckId: EDeckIds, url: string) => void
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
        <div className="flex">
            <Card
                className={cn(
                    'w-full relative flex items-center justify-between p-4 pr-6 shadow-none',
                    isFocused && 'shadow-[inset_0_0_12px_1px] shadow-primary',
                )}
                onClick={() => handleClick(trackId)}
            >
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, trackId)}>
                    <ArrowUpCircle />
                </Button>
                <MarqueeText text={fileName} />
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, trackId)}>
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

const LibraryDropdownMenu = ({ trackId }: { trackId: string }) => {
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: ['playlists'],
        queryFn: () => getPlaylists(),
    })
    const { deleteTrackMutation } = useTrackMutation()
    const { addTracksToPlaylistMutation } = usePlaylistMutation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <span>Add to Playlist</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        {playlistsQuery.data?.map((playlist) => (
                            <DropdownMenuItem
                                key={playlist.id}
                                onClick={() => {
                                    addTracksToPlaylistMutation.mutate({ id: playlist.id, trackIds: [trackId] })
                                }}
                            >
                                <span>{playlist.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => deleteTrackMutation.mutate(trackId)}>
                    <span>Delete Track from Library</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const PlaylistDropdownMenu = ({ trackId }: { trackId: string }) => {
    const { deleteTracksFromPlaylistMutation } = usePlaylistMutation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onClick={() => deleteTracksFromPlaylistMutation.mutate([trackId])}>
                    <span>Delete Track from Playlist</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default List
