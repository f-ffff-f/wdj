'use client'
import { getPlaylists } from '@/app/main/_actions/playlist'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/lib/client/components/ui/dropdown-menu'
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/lib/client/components/ui/sidebar'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import PlaylistForm from './PlaylistForm'
import { Label } from '@/lib/client/components/ui/label'

const Playlists = () => {
    const router = useRouter()
    const { playlistId } = useParams<{ playlistId?: string }>()

    const { data: playlists, error } = useQuery({
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

    const handleDeletePlaylist = (selectedPlaylistId: string) => {
        deletePlaylistMutation.mutate(selectedPlaylistId)
        if (playlistId === selectedPlaylistId) {
            router.push(`/main/${PLAYLIST_DEFAULT_ID}`)
        }
    }

    if (playlists && !playlists.success) {
        return <Label>{playlists.error}</Label>
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
                        <SidebarMenuButton className="cursor-pointer" isActive={!playlistId} asChild>
                            <Link href={`/main/${PLAYLIST_DEFAULT_ID}`}>Library</Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {playlists?.data?.map((playlist) => {
                        return editingPlaylistId !== playlist.id ? (
                            <SidebarMenuItem key={playlist.id}>
                                <SidebarMenuButton
                                    className="cursor-pointer"
                                    isActive={playlist.id === playlistId}
                                    asChild
                                >
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
