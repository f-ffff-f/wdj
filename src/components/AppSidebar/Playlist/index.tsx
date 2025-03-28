'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import { usePlaylistQuery } from '@/lib/client/hooks/usePlaylistQuery'
import { state } from '@/lib/client/state'
import { UnauthorizedError } from '@/lib/shared/errors/CustomError'
import { LoaderCircle, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useSnapshot } from 'valtio'
import PlaylistForm from './PlaylistForm'
const Playlist = () => {
    const currentPlaylistId = useSnapshot(state).UI.currentPlaylistId
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)
    const { playlistsQuery, isLoadingPlaylists, errorPlaylists } = usePlaylistQuery()
    const { createPlaylistMutation, updatePlaylistMutation, deletePlaylistMutation } = usePlaylistMutation()

    // 새 플레이리스트 추가 핸들러
    const handleAddPlaylist = (data: { name: string }) => {
        createPlaylistMutation.mutate(data.name)
    }

    // 플레이리스트 수정 핸들러
    const handleUpdatePlaylist = (playlistId: string, data: { name: string }) => {
        updatePlaylistMutation.mutate({ id: playlistId, name: data.name })
        setEditingPlaylistId(null)
    }

    const handleDeletePlaylist = (playlistId: string) => {
        deletePlaylistMutation.mutate(playlistId)
        if (state.UI.currentPlaylistId === playlistId) {
            state.UI.currentPlaylistId = ''
        }
    }

    return (
        <div>
            <SidebarGroupLabel>Playlists</SidebarGroupLabel>

            {/* 새 플레이리스트 추가 폼 (생성 모드) */}
            <PlaylistForm
                onSubmit={handleAddPlaylist}
                isSubmitting={createPlaylistMutation.isPending}
                placeholder="New Playlist Name"
            />
            <div className="mb-1" />

            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="cursor-pointer"
                            isActive={currentPlaylistId === ''}
                            asChild
                            onClick={() => {
                                state.UI.currentPlaylistId = ''
                            }}
                        >
                            <span>Library</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isLoadingPlaylists ? (
                        <div className="flex items-center justify-center">
                            <LoaderCircle className="animate-spin" />
                        </div>
                    ) : errorPlaylists ? (
                        errorPlaylists instanceof UnauthorizedError ? null : (
                            <div className="text-center py-2 text-destructive">{errorPlaylists.message}</div>
                        )
                    ) : (
                        playlistsQuery?.map((playlist) => {
                            return editingPlaylistId !== playlist.id ? (
                                <SidebarMenuItem key={playlist.id}>
                                    <SidebarMenuButton
                                        isActive={currentPlaylistId === playlist.id}
                                        className="cursor-pointer playlist-item"
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
                                                disabled={deletePlaylistMutation.isPending}
                                            >
                                                <span>Rename Playlist</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeletePlaylist(playlist.id)}
                                                disabled={deletePlaylistMutation.isPending}
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
                                    isSubmitting={updatePlaylistMutation.isPending}
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
