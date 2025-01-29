import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    AddTracksToPlaylistAPI,
    CreatePlaylistAPI,
    DeletePlaylistAPI,
    GetPlaylistsAPI,
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
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey })

            const previousPlaylists = queryClient.getQueryData<GetPlaylistsAPI['Response']>(queryKey)

            // 임시 ID 생성
            const tempId = `temp-${Date.now()}`
            const newPlaylist = {
                id: tempId,
                name,
                createdAt: new Date(),
                tracks: [],
            }

            queryClient.setQueryData<GetPlaylistsAPI['Response']>(queryKey, (old = []) => [newPlaylist, ...old])

            return { previousPlaylists }
        },
        onError: (err, newName, context) => {
            queryClient.setQueryData(queryKey, context?.previousPlaylists)
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
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey })

            const previousPlaylists = queryClient.getQueryData<GetPlaylistsAPI['Response']>(queryKey)

            queryClient.setQueryData<GetPlaylistsAPI['Response']>(queryKey, (old = []) =>
                old.map((playlist) => (playlist.id === id ? { ...playlist, name } : playlist)),
            )

            return { previousPlaylists }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKey, context?.previousPlaylists)
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
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey })

            const previousPlaylists = queryClient.getQueryData<GetPlaylistsAPI['Response']>(queryKey)

            queryClient.setQueryData<GetPlaylistsAPI['Response']>(queryKey, (old = []) =>
                old.filter((playlist) => playlist.id !== id),
            )

            return { previousPlaylists }
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(queryKey, context?.previousPlaylists)
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

    const addTracksToPlaylist = isAuthenticated ? addTracksToPlaylistMutation.mutate : valtioAction.addTrackToPlaylist

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
    }
}
