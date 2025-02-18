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
import { deckoSingleton, EDeckIds } from '@ghr95223/decko'
import { usePlaylist } from '@/lib/client/hooks/usePlaylist'
import { useTrack } from '@/lib/client/hooks/useTrack'
import { state } from '@/lib/client/state'
import { cn } from '@/lib/client/utils'
import { MoreVertical } from 'lucide-react'
import React from 'react'
import { useSnapshot } from 'valtio'

const List = () => {
    const snapshot = useSnapshot(state)
    const { tracksQuery, getTrackBlobUrl } = useTrack()
    const { playlistTracksQuery } = usePlaylist()

    const focusedTrackId = state.UI.focusedTrackId

    const handleLoadToDeck = async (deckId: EDeckIds, id: string) => {
        const url = await getTrackBlobUrl(id)
        deckoSingleton.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.UI.focusedTrackId = id
    }

    return (
        <div className="max-w-2xl min-h-10 flex flex-col gap-1 overflow-x-hidden" id="track-list">
            {snapshot.UI.currentPlaylistId === ''
                ? tracksQuery?.map((track) => (
                      <Item
                          key={track.id}
                          id={track.id}
                          fileName={track.fileName}
                          isFocused={focusedTrackId === track.id}
                          handleLoadToDeck={handleLoadToDeck}
                          handleClick={handleClick}
                      >
                          <LibraryDropdownMenu id={track.id} />
                      </Item>
                  ))
                : playlistTracksQuery?.map((track) => (
                      <Item
                          key={track.id}
                          id={track.id}
                          fileName={track.fileName}
                          isFocused={focusedTrackId === track.id}
                          handleLoadToDeck={handleLoadToDeck}
                          handleClick={handleClick}
                      >
                          <PlaylistDropdownMenu id={track.id} />
                      </Item>
                  ))}
        </div>
    )
}

interface ITrackListItemProps {
    id: string
    fileName: string
    isFocused: boolean
    handleLoadToDeck: (deckId: EDeckIds, url: string) => void
    handleClick: (id: string) => void
    children: React.ReactNode
}

const Item: React.FC<ITrackListItemProps> = ({ id, fileName, isFocused, handleLoadToDeck, handleClick, children }) => {
    return (
        <div className="flex">
            <Card
                className={cn(
                    'w-full relative flex items-center justify-between p-4 pr-6 shadow-none',
                    isFocused && 'shadow-[inset_0_0_12px_1px] shadow-primary',
                )}
                onClick={() => handleClick(id)}
            >
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, id)}>load deck 1</Button>
                <div className="text-center break-words overflow-hidden min-w-0">{fileName}</div>
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, id)}>load deck 2</Button>
                {children}
            </Card>
        </div>
    )
}

const LibraryDropdownMenu = ({ id }: { id: string }) => {
    const { deleteTrack } = useTrack()
    const { playlistsQuery, addTracksToPlaylist } = usePlaylist()

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
                        {playlistsQuery?.map((playlist) => (
                            <DropdownMenuItem
                                key={playlist.id}
                                onClick={() => {
                                    addTracksToPlaylist({ id: playlist.id, trackIds: [id] })
                                }}
                            >
                                <span>{playlist.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => deleteTrack(id)}>
                    <span>Delete Track from Library</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const PlaylistDropdownMenu = ({ id }: { id: string }) => {
    const { deleteTracksFromPlaylist } = usePlaylist()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onClick={() => deleteTracksFromPlaylist([id])}>
                    <span>Delete Track from Playlist</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default List
