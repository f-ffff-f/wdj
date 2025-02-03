import { audioManager } from '@/app/_lib/audioManager/audioManagerSingleton'
import { EDeckIds } from '@/app/_lib/constants'
import { usePlaylist } from '@/app/_lib/hooks/usePlaylist'
import { useTrack } from '@/app/_lib/hooks/useTrack'
import { state } from '@/app/_lib/state'
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
import { cn } from '@/lib/utils'
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
        audioManager.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.UI.focusedTrackId = id
    }

    return (
        <div className="w-full max-w-2xl mx-auto min-h-10 flex flex-col gap-1" id="vault-list">
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
                    'relative flex flex-1 items-center justify-between p-4 pr-6',
                    isFocused && 'outline outline-1 outline-primary',
                )}
                onClick={() => handleClick(id)}
            >
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, id)}>load to deck 1</Button>
                <span className="flex-1 text-center px-4">{fileName}</span>
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, id)}>load to deck 2</Button>
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
