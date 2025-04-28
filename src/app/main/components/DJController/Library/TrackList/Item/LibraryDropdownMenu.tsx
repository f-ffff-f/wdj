'use client'

import React from 'react'
import { Label } from '@/lib/client/components/ui/label'
import {
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/lib/client/components/ui/dropdown-menu'
import { fetchPlaylists } from '@/app/main/_fetchers/playlists'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { useSuspenseQuery } from '@tanstack/react-query'

export interface LibraryDropdownMenuProps {
    trackId: string
}

const LibraryDropdownMenu = ({ trackId }: LibraryDropdownMenuProps) => {
    const playlists = useSuspenseQuery({
        queryKey: ['playlists'],
        queryFn: fetchPlaylists,
    })

    const { connectTrackToPlaylistMutation, deleteTrackMutation } = useTrackMutation()

    if (playlists.error) {
        return <Label>{playlists.error.message}</Label>
    }

    return (
        <>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <span>Add to Playlist</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {playlists.data?.length ? (
                        playlists.data?.map((playlist) => (
                            <DropdownMenuItem
                                key={playlist.id}
                                onClick={() => {
                                    connectTrackToPlaylistMutation.mutate({
                                        playlistId: playlist.id,
                                        trackId,
                                    })
                                }}
                            >
                                <span>{playlist.name}</span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <Label>No playlists available</Label>
                    )}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
                data-testid={`dropdown-item-delete-${trackId}`}
                onClick={() => deleteTrackMutation.mutate(trackId)}
            >
                <span>Delete Track from Library</span>
            </DropdownMenuItem>
        </>
    )
}

export default LibraryDropdownMenu
