'use client'

import { DropdownMenuItem } from '@/lib/client/components/ui/dropdown-menu'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { useParams } from 'next/navigation'

export interface PlaylistDropdownProps {
    trackId: string
}

const PlaylistDropdown = ({ trackId }: PlaylistDropdownProps) => {
    const { disconnectTrackFromPlaylistMutation } = useTrackMutation()
    const { playlistId: playlistIdParam } = useParams<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>()

    return (
        <DropdownMenuItem
            onClick={() =>
                disconnectTrackFromPlaylistMutation.mutate({
                    playlistId: playlistIdParam,
                    trackId,
                })
            }
        >
            <span>Delete Track from Playlist</span>
        </DropdownMenuItem>
    )
}

export default PlaylistDropdown
