'use client'
import { getPlaylists } from '@/app/main/actions'
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
import { state } from '@/lib/client/state'
import { Playlist } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import PlaylistForm from './PlaylistForm'
import Link from 'next/link'

const Playlists = () => {
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })

    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)

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
                            asChild
                            onClick={() => {
                                state.UI.currentPlaylistId = ''
                            }}
                        >
                            <Link href="/main">Library</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {playlistsQuery?.data?.map((playlist) => {
                        return editingPlaylistId !== playlist.id ? (
                            <SidebarMenuItem key={playlist.id}>
                                <SidebarMenuButton className="cursor-pointer playlist-item" asChild>
                                    <Link href={`/main/${playlist.id}`}>{playlist.name}</Link>
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
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </div>
    )
}

export default Playlists
