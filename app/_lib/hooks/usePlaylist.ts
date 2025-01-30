import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AddTracksToPlaylistAPI,
    CreatePlaylistAPI,
    DeletePlaylistAPI,
    GetPlaylistsAPI,
    GetTracksAPI,
    UpdatePlaylistAPI,
} from '@/app/types/api'
import { fetcher } from '@/app/_lib/queryClient/fetcher'
import { useCurrentUser } from '@/app/_lib/hooks/useCurrentUser'
import { useSnapshot } from 'valtio'
import { state, valtioAction } from '@/app/_lib/state'

/**
 * 플레이리스트 관련 커스텀 훅
 */
export const usePlaylist = () => {
    const snapshot = useSnapshot(state)
    const { isAuthenticated } = useCurrentUser()

    const queryClient = useQueryClient()
    const queryKey = ['/api/playlist']

    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<GetPlaylistsAPI['Response']>({
        queryKey,
        queryFn: () => fetcher('/api/playlist'),
        retry: false,
    })

    const playlists = isAuthenticated ? playlistsQuery.data : snapshot.guest.playlists

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            return fetcher('/api/playlist/create', {
                method: 'POST',
                body: JSON.stringify({ name }),
            }) as Promise<CreatePlaylistAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const createPlaylist = isAuthenticated ? createPlaylistMutation.mutate : valtioAction.createPlaylist

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            return fetcher(`/api/playlist/${id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ name }),
            }) as Promise<UpdatePlaylistAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const updatePlaylist = isAuthenticated ? updatePlaylistMutation.mutate : valtioAction.updatePlaylist

    /**
     * 플레이리스트 삭제 뮤테이션
     */
    const deletePlaylistMutation = useMutation({
        mutationFn: async (id: string) => {
            return fetcher(`/api/playlist/${id}/delete`, {
                method: 'DELETE',
            }) as Promise<DeletePlaylistAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const deletePlaylist = isAuthenticated ? deletePlaylistMutation.mutate : valtioAction.deletePlaylist

    const addTracksToPlaylistMutation = useMutation({
        mutationFn: async ({ id, trackIds }: { id: string; trackIds: string[] }) => {
            return fetcher(`/api/playlist/${id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ trackIds }),
            }) as Promise<AddTracksToPlaylistAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const addTracksToPlaylist = isAuthenticated ? addTracksToPlaylistMutation.mutate : valtioAction.addTracksToPlaylist

    const playlistTracksQuery = useQuery<GetTracksAPI['Response']>({
        queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId],
        queryFn: () => fetcher(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`),
        enabled: !!snapshot.UI.currentPlaylistId,
    })

    const playlistTracks = isAuthenticated
        ? playlistTracksQuery.data
        : snapshot.guest.tracks.filter((track) => track.playlistIds.includes(snapshot.UI.currentPlaylistId))

    const deleteTracksFromPlaylistMutation = useMutation({
        mutationFn: async (trackIds: string[]) => {
            return fetcher(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`, {
                method: 'DELETE',
                body: JSON.stringify({ trackIds }),
            }) as Promise<DeletePlaylistAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const deleteTracksFromPlaylist = isAuthenticated
        ? deleteTracksFromPlaylistMutation.mutate
        : valtioAction.deleteTracksFromPlaylist

    return {
        playlists,
        isLoading: playlistsQuery.isLoading,
        error: playlistsQuery.error,
        createPlaylist,
        isCreating: createPlaylistMutation.isPending,
        updatePlaylist,
        isUpdating: updatePlaylistMutation.isPending,
        deletePlaylist,
        isDeleting: deletePlaylistMutation.isPending,
        addTracksToPlaylist,
        isAddingTracks: addTracksToPlaylistMutation.isPending,
        playlistTracks,
        isLoadingPlaylistTracks: playlistTracksQuery.isLoading,
        errorPlaylistTracks: playlistTracksQuery.error,
        deleteTracksFromPlaylist,
        isDeletingTracks: deleteTracksFromPlaylistMutation.isPending,
    }
}
