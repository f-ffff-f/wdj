import { addPlaylist, deletePlaylist, renamePlaylist, state } from '@/app/_lib/state'
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
} from '@/components/ui/sidebar'
import { useSnapshot } from 'valtio'
import { Check, MoreHorizontal, Plus, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const AppSidebar = () => {
    const snapshot = useSnapshot(state)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [editingPlaylistName, setEditingPlaylistName] = useState('')
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null)

    const handleAddPlaylist = () => {
        if (!newPlaylistName.trim()) return

        addPlaylist(newPlaylistName)
        setNewPlaylistName('') // 입력창 초기화
    }

    const startRenamePlaylist = (playlistId: string) => {
        setEditingPlaylistId(playlistId)
    }

    const handleRenamePlaylist = (playlistId: string) => {
        renamePlaylist(playlistId, editingPlaylistName)
        setEditingPlaylistId(null)
        setEditingPlaylistName('')
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
                            {snapshot.vault.playlists.map((playlist) => {
                                return editingPlaylistId !== playlist.id ? (
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
                                                <DropdownMenuItem onClick={() => startRenamePlaylist(playlist.id)}>
                                                    <span>Rename Playlist</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeletePlaylist(playlist.id)}>
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
                                            placeholder="바꿀 플레이리스트 이름"
                                            value={editingPlaylistName}
                                            onChange={(e) => setEditingPlaylistName(e.target.value)}
                                            className="h-8"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => setEditingPlaylistId(null)}
                                            title="플레이리스트 이름 변경 취소"
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">플레이리스트 이름 변경 취소</span>
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleRenamePlaylist(playlist.id)}
                                            title="플레이리스트 이름 변경"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span className="sr-only">플레이리스트 이름 변경</span>
                                        </Button>
                                    </div>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar
