'use client'

import PlaylistsList from '@/app/main/components/AppSidebar/Playlists/List'
import { SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/lib/client/components/ui/sidebar'
import { usePlaylistMutation } from '@/lib/client/hooks/usePlaylistMutation'
import PlaylistForm from './PlaylistForm'

const Playlists = () => {
    const { createPlaylistMutation } = usePlaylistMutation()

    // 새 플레이리스트 추가 핸들러
    const handleAddPlaylist = (data: { name: string }) => {
        createPlaylistMutation.mutate(data.name)
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
                    <PlaylistsList />
                </SidebarMenu>
            </SidebarGroupContent>
        </div>
    )
}

export default Playlists
