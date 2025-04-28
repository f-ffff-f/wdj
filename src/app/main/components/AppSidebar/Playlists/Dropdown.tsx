'use client'

import { DropdownMenuItem } from '@/lib/client/components/ui/dropdown-menu'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import router from 'next/router'

const DropdownContent = ({
    playlistId,
    setEditingPlaylistId,
}: {
    playlistId: string
    setEditingPlaylistId: (id: string) => void
}) => {
    const { deletePlaylistMutation } = usePlaylistMutation()

    const handleDeletePlaylist = (selectedPlaylistId: string) => {
        deletePlaylistMutation.mutate(selectedPlaylistId)
        if (playlistId === selectedPlaylistId) {
            router.push(`/main/${PLAYLIST_DEFAULT_ID}`)
        }
    }

    return (
        <>
            <DropdownMenuItem
                onClick={() => setEditingPlaylistId(playlistId)}
                disabled={deletePlaylistMutation.isPending}
            >
                <span>Rename Playlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => handleDeletePlaylist(playlistId)}
                disabled={deletePlaylistMutation.isPending}
                className="text-destructive"
            >
                <span>Delete Playlist</span>
            </DropdownMenuItem>
        </>
    )
}

export default DropdownContent
