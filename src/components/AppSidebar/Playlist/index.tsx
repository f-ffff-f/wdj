import { usePlaylist } from '@/lib/client/hooks/usePlaylist'
import { state } from '@/lib/client/state'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Check, MoreHorizontal, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useSnapshot } from 'valtio'

const Playlist = () => {
    const snapshot = useSnapshot(state)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [editingPlaylistName, setEditingPlaylistName] = useState('')
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
    const {
        playlistsQuery,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        isCreating,
        isUpdating,
        isDeleting,
        isLoading,
        error,
    } = usePlaylist()

    const handleAddPlaylist = () => {
        if (!newPlaylistName.trim()) return

        createPlaylist(newPlaylistName)
        setNewPlaylistName('') // 입력창 초기화
    }

    const startRenamePlaylist = (playlistId: string) => {
        const playlist = playlistsQuery?.find((p) => p.id === playlistId)
        if (playlist) {
            setEditingPlaylistId(playlistId)
            setEditingPlaylistName(playlist.name)
        }
    }

    const handleRenamePlaylist = (playlistId: string) => {
        if (!editingPlaylistName.trim()) return

        updatePlaylist(
            { id: playlistId, name: editingPlaylistName },
            {
                onSuccess: () => {
                    setEditingPlaylistId(null)
                    setEditingPlaylistName('')
                },
            },
        )
    }

    const handleDeletePlaylist = (playlistId: string) => {
        deletePlaylist(playlistId)
        state.UI.currentPlaylistId = ''
    }

    return (
        <div>
            <SidebarGroupLabel>Playlists</SidebarGroupLabel>

            <div className="flex w-full mb-1 items-center space-x-2">
                <Input
                    type="text"
                    placeholder="New Playlist Name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="h-8"
                    disabled={isCreating}
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleAddPlaylist}
                    title="Add Playlist"
                    disabled={isCreating}
                >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Playlist</span>
                </Button>
            </div>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="cursor-pointer"
                            isActive={snapshot.UI.currentPlaylistId === ''}
                            asChild
                            onClick={() => {
                                state.UI.currentPlaylistId = ''
                            }}
                        >
                            <span>Library</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isLoading ? (
                        <div className="text-center py-2">loading...</div>
                    ) : error ? (
                        error instanceof Error && error.message === 'Token is not exist' ? null : (
                            <div className="text-center py-2 text-destructive">에러: {error.message}</div>
                        )
                    ) : (
                        playlistsQuery?.map((playlist) => {
                            return editingPlaylistId !== playlist.id ? (
                                <SidebarMenuItem key={playlist.id}>
                                    <SidebarMenuButton
                                        isActive={snapshot.UI.currentPlaylistId === playlist.id}
                                        className="cursor-pointer"
                                        asChild
                                        onClick={() => {
                                            state.UI.currentPlaylistId = playlist.id
                                        }}
                                    >
                                        <span>{playlist.name}</span>
                                    </SidebarMenuButton>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction>
                                                <MoreHorizontal />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuItem
                                                onClick={() => startRenamePlaylist(playlist.id)}
                                                disabled={isDeleting}
                                            >
                                                <span>Rename Playlist</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeletePlaylist(playlist.id)}
                                                disabled={isDeleting}
                                                className="text-destructive"
                                            >
                                                <span>Delete Playlist</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ) : (
                                <div className="flex w-full mb-1 items-center space-x-2" key={playlist.id}>
                                    <Input
                                        autoFocus
                                        type="text"
                                        placeholder="Change Playlist Name"
                                        value={editingPlaylistName}
                                        onChange={(e) => setEditingPlaylistName(e.target.value)}
                                        className="h-8"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => setEditingPlaylistId(null)}
                                        title="Cancel Playlist Name Change"
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Cancel Playlist Name Change</span>
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => handleRenamePlaylist(playlist.id)}
                                        title="Change Playlist Name"
                                        disabled={isUpdating}
                                    >
                                        <Check className="h-4 w-4" />
                                        <span className="sr-only">Change Playlist Name</span>
                                    </Button>
                                </div>
                            )
                        })
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </div>
    )
}

export default Playlist
