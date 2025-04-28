'use client'

import { fetchPlaylists } from '@/app/main/_fetchers/playlists'
import { DropdownMenuContent, DropdownMenuTrigger } from '@/lib/client/components/ui/dropdown-menu'
import { Label } from '@/lib/client/components/ui/label'
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from '@/lib/client/components/ui/sidebar'
import MyLoader from '@/lib/client/components/utils/MyLoader'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { Suspense, useState } from 'react'
import PlaylistForm from './PlaylistForm'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'

const Dropdown = React.lazy(() => import('@/app/main/components/AppSidebar/Playlists/Dropdown'))

const PlaylistsList = () => {
    const { playlistId } = useParams<{ playlistId?: string }>()

    const playlists = useQuery({
        queryKey: ['playlists'],
        queryFn: () => fetchPlaylists(),
    })

    const { updatePlaylistMutation } = usePlaylistMutation()

    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)

    // 플레이리스트 수정 핸들러
    const handleUpdatePlaylist = (playlistId: string, data: { name: string }) => {
        updatePlaylistMutation.mutate({ id: playlistId, name: data.name })
        setEditingPlaylistId(null)
    }

    if (playlists.error) {
        return <Label>{playlists.error.message}</Label>
    }

    if (playlists.isLoading) {
        return <MyLoader />
    }
    return (
        <div>
            <SidebarMenuItem>
                <SidebarMenuButton className="cursor-pointer" isActive={playlistId === PLAYLIST_DEFAULT_ID} asChild>
                    <Link href={`/main/${PLAYLIST_DEFAULT_ID}`}>Library</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            {playlists?.data?.map((playlist) => {
                return editingPlaylistId !== playlist.id ? (
                    <SidebarMenuItem key={playlist.id}>
                        <SidebarMenuButton className="cursor-pointer" isActive={playlist.id === playlistId} asChild>
                            <Link href={`/main/${playlist.id}`}>{playlist.name}</Link>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                                <Suspense fallback={<MyLoader />}>
                                    <Dropdown playlistId={playlist.id} setEditingPlaylistId={setEditingPlaylistId} />
                                </Suspense>
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
        </div>
    )
}

export default PlaylistsList
