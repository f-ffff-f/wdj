import { fetchWithToken } from '@/app/_lib/utils'
import { state } from '@/app/_lib/state'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { Playlist, Track } from '@prisma/client'

/**
 * 플레이리스트 관련 커스텀 훅
 */
export const usePlaylist = () => {
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()
    const queryKey = ['/api/playlist']

    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey,
        queryFn: () => fetchWithToken('/api/playlist'),
        retry: false,
    })

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation<Playlist, Error, string>({
        mutationFn: async (name: string) => {
            return fetchWithToken('/api/playlist/create', {
                method: 'POST',
                body: JSON.stringify({ name }),
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation<
        Playlist,
        Error,
        { id: string; name: string },
        { onSuccess?: () => void }
    >({
        mutationFn: async (params: { id: string; name: string }) => {
            return fetchWithToken(`/api/playlist/${params.id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ name: params.name }),
            })
        },
        onSuccess: (data, variables, context) => {
            context?.onSuccess?.()
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    /**
     * 플레이리스트 삭제 뮤테이션
     */
    const deletePlaylistMutation = useMutation({
        mutationFn: async (id: string) => {
            return fetchWithToken(`/api/playlist/${id}/delete`, {
                method: 'DELETE',
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const addTracksToPlaylistMutation = useMutation<Playlist, Error, { id: string; trackIds: string[] }>({
        mutationFn: async ({ id, trackIds }) => {
            return fetchWithToken(`/api/playlist/${id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ trackIds }),
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId],
        queryFn: () => fetchWithToken(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`),
        enabled: !!snapshot.UI.currentPlaylistId,
    })

    const deleteTracksFromPlaylistMutation = useMutation<Playlist, Error, string[]>({
        mutationFn: async (trackIds) => {
            return fetchWithToken(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`, {
                method: 'DELETE',
                body: JSON.stringify({ trackIds }),
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    return {
        playlistsQuery: playlistsQuery.data,
        isLoading: playlistsQuery.isLoading,
        error: playlistsQuery.error,
        createPlaylist: createPlaylistMutation.mutate,
        isCreating: createPlaylistMutation.isPending,
        updatePlaylist: updatePlaylistMutation.mutate,
        isUpdating: updatePlaylistMutation.isPending,
        deletePlaylist: deletePlaylistMutation.mutate,
        isDeleting: deletePlaylistMutation.isPending,
        addTracksToPlaylist: addTracksToPlaylistMutation.mutate,
        isAddingTracks: addTracksToPlaylistMutation.isPending,
        playlistTracksQuery: playlistTracksQuery.data,
        isLoadingPlaylistTracks: playlistTracksQuery.isLoading,
        errorPlaylistTracks: playlistTracksQuery.error,
        deleteTracksFromPlaylist: deleteTracksFromPlaylistMutation.mutate,
        isDeletingTracks: deleteTracksFromPlaylistMutation.isPending,
    }
}
