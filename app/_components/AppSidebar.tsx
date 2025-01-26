import { addPlaylist, deletePlaylist, state } from '@/app/_lib/state'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { useSnapshot } from 'valtio'
import { MoreHorizontal, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AppSidebar() {
    const snapshot = useSnapshot(state)
    const [newPlaylistName, setNewPlaylistName] = useState('')

    const handleAddPlaylist = () => {
        if (!newPlaylistName.trim()) return

        addPlaylist(newPlaylistName)
        setNewPlaylistName('') // 입력창 초기화
    }

    const handleDeletePlaylist = (playlistId: string) => {
        deletePlaylist(playlistId)
    }

    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Playlists</SidebarGroupLabel>

                    <div className="flex w-full mb-1 items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="새 플레이리스트 이름"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddPlaylist()
                                }
                            }}
                            className="h-8"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleAddPlaylist}
                            title="플레이리스트 추가"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">플레이리스트 추가</span>
                        </Button>
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="cursor-pointer"
                                    isActive={snapshot.vault.currentPlaylistId === ''}
                                    asChild
                                    onClick={() => {
                                        state.vault.currentPlaylistId = ''
                                    }}
                                >
                                    <a>Library</a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {snapshot.vault.playlists.map((playlist) => (
                                <SidebarMenuItem key={playlist.id}>
                                    <SidebarMenuButton
                                        className="cursor-pointer"
                                        isActive={snapshot.vault.currentPlaylistId === playlist.id}
                                        asChild
                                        onClick={() => {
                                            state.vault.currentPlaylistId = playlist.id
                                            state.vault.focusedTrackId =
                                                snapshot.vault.tracks.filter((track) =>
                                                    track.playlistIds.includes(playlist.id),
                                                )?.[0]?.id ?? state.vault.focusedTrackId
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
                                            <DropdownMenuItem onClick={() => handleDeletePlaylist(playlist.id)}>
                                                <span>Delete Playlist</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
