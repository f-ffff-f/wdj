import { usePlaylist } from '@/lib/client/hooks/usePlaylist'
import { state } from '@/lib/client/state'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { LoaderCircle, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useSnapshot } from 'valtio'
import { UnauthorizedError } from '@/lib/CustomErrors'
import PlaylistForm from './PlaylistForm'

const Playlist = () => {
    const snapshot = useSnapshot(state)
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

    // 새 플레이리스트 추가 핸들러
    const handleAddPlaylist = (data: { name: string }) => {
        createPlaylist(data.name)
    }

    // 플레이리스트 수정 핸들러
    const handleUpdatePlaylist = (playlistId: string, data: { name: string }) => {
        updatePlaylist(
            { id: playlistId, name: data.name },
            {
                onSuccess: () => {
                    setEditingPlaylistId(null)
                },
            },
        )
    }

    const handleDeletePlaylist = (playlistId: string) => {
        deletePlaylist(playlistId)
        if (state.UI.currentPlaylistId === playlistId) {
            state.UI.currentPlaylistId = ''
        }
    }

    return (
        <div>
            <SidebarGroupLabel>Playlists</SidebarGroupLabel>

            {/* 새 플레이리스트 추가 폼 (생성 모드) */}
            <PlaylistForm onSubmit={handleAddPlaylist} isSubmitting={isCreating} placeholder="New Playlist Name" />
            <div className="mb-1" />

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
                        <div className="flex items-center justify-center">
                            <LoaderCircle className="animate-spin" />
                        </div>
                    ) : error ? (
                        error instanceof UnauthorizedError ? null : (
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
                                                onClick={() => setEditingPlaylistId(playlist.id)}
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
                                <PlaylistForm
                                    key={playlist.id}
                                    onSubmit={(data) => handleUpdatePlaylist(playlist.id, data)}
                                    isSubmitting={isUpdating}
                                    initialValue={playlist.name}
                                    onCancel={() => setEditingPlaylistId(null)}
                                    placeholder="Change Playlist Name"
                                />
                            )
                        })
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </div>
    )
}

export default Playlist
