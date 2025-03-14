import { customFetcher } from '@/lib/client/utils/customFetcher'
import { state } from '@/lib/client/state'
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
        queryFn: () => customFetcher('/api/playlist'),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            return customFetcher('/api/playlist/create', {
                method: 'POST',
                body: JSON.stringify({ name }),
            })
        },
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)

            const tempId = `temp-${Date.now()}`

            if (previousPlaylists) {
                const newPlaylist: Playlist = {
                    id: tempId,
                    name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: '', // 실제 값은 서버에서 설정됨
                }

                queryClient.setQueryData<Playlist[]>(queryKey, [newPlaylist, ...previousPlaylists])
            }

            return { previousPlaylists }
        },
        onError: (error, name, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(queryKey, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async (params: { id: string; name: string }) => {
            return customFetcher(`/api/playlist/${params.id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ name: params.name }),
            })
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({ queryKey })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    queryKey,
                    previousPlaylists.map((playlist) =>
                        playlist.id === params.id
                            ? { ...playlist, name: params.name, updatedAt: new Date() }
                            : playlist,
                    ),
                )
            }

            return { previousPlaylists }
        },
        onError: (error, params, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(queryKey, context.previousPlaylists)
            }
            alert(error)
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
            return customFetcher(`/api/playlist/${id}/delete`, {
                method: 'DELETE',
            })
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(queryKey)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    queryKey,
                    previousPlaylists.filter((playlist) => playlist.id !== id),
                )
            }

            return { previousPlaylists }
        },
        onError: (error, id, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(queryKey, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const addTracksToPlaylistMutation = useMutation<Playlist, Error, { id: string; trackIds: string[] }>({
        mutationFn: async ({ id, trackIds }) => {
            return customFetcher(`/api/playlist/${id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ trackIds }),
            })
        },
        onSettled: ({ ...data }) => {
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', data?.id] })
        },
        onError: (error) => {
            alert(error)
        },
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId],
        queryFn: () => customFetcher(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`),
        enabled: !!snapshot.UI.currentPlaylistId,
        staleTime: 1000 * 60 * 10,
    })

    const deleteTracksFromPlaylistMutation = useMutation({
        mutationFn: async (trackIds: string[]) => {
            return customFetcher(`/api/playlist/${snapshot.UI.currentPlaylistId}/tracks`, {
                method: 'DELETE',
                body: JSON.stringify({ trackIds }),
            })
        },
        onMutate: async (trackIds) => {
            await queryClient.cancelQueries({ queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId] })
            const previousTracks = queryClient.getQueryData<Track[]>(['/api/playlist', snapshot.UI.currentPlaylistId])

            if (previousTracks) {
                queryClient.setQueryData<Track[]>(
                    ['/api/playlist', snapshot.UI.currentPlaylistId],
                    previousTracks.filter((track) => !trackIds.includes(track.id)),
                )
            }

            return { previousTracks }
        },
        onError: (error, trackIds, context) => {
            if (context?.previousTracks) {
                queryClient.setQueryData(['/api/playlist', snapshot.UI.currentPlaylistId], context.previousTracks)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId] })
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
