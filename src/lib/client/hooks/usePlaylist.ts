import { customFetcher } from '@/lib/client/utils/customFetcher'
import { state } from '@/lib/client/state'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { Playlist, Track } from '@prisma/client'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'

const BASE_URL = '/api/playlist'

export const usePlaylist = () => {
    const { session } = useClientAuth()
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()
    const dynamicQueryKey = [session?.user.id, BASE_URL]

    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: dynamicQueryKey,
        queryFn: () => customFetcher(BASE_URL),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            return customFetcher(`${BASE_URL}/create`, {
                method: 'POST',
                body: JSON.stringify({ name }),
            })
        },
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey: dynamicQueryKey })

            const previousPlaylists = queryClient.getQueryData<Playlist[]>(dynamicQueryKey)

            const tempId = `temp-${Date.now()}`

            if (previousPlaylists) {
                const newPlaylist: Playlist = {
                    id: tempId,
                    name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: '', // 실제 값은 서버에서 설정됨
                }

                queryClient.setQueryData<Playlist[]>(dynamicQueryKey, [newPlaylist, ...previousPlaylists])
            }

            return { previousPlaylists }
        },
        onError: (error, name, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(dynamicQueryKey, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: dynamicQueryKey })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async (params: { id: string; name: string }) => {
            return customFetcher(`${BASE_URL}/${params.id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ name: params.name }),
            })
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({ queryKey: dynamicQueryKey })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(dynamicQueryKey)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    dynamicQueryKey,
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
                queryClient.setQueryData(dynamicQueryKey, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: dynamicQueryKey })
        },
    })

    /**
     * 플레이리스트 삭제 뮤테이션
     */
    const deletePlaylistMutation = useMutation({
        mutationFn: async (id: string) => {
            return customFetcher(`${BASE_URL}/${id}/delete`, {
                method: 'DELETE',
            })
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: dynamicQueryKey })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(dynamicQueryKey)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    dynamicQueryKey,
                    previousPlaylists.filter((playlist) => playlist.id !== id),
                )
            }

            return { previousPlaylists }
        },
        onError: (error, id, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(dynamicQueryKey, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: dynamicQueryKey })
        },
    })

    const addTracksToPlaylistMutation = useMutation<Playlist, Error, { id: string; trackIds: string[] }>({
        mutationFn: async ({ id, trackIds }) => {
            return customFetcher(`${BASE_URL}/${id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ trackIds }),
            })
        },
        onSettled: ({ ...data }) => {
            queryClient.invalidateQueries({ queryKey: [...dynamicQueryKey, data?.id] })
        },
        onError: (error) => {
            alert(error)
        },
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: [...dynamicQueryKey, snapshot.UI.currentPlaylistId],
        queryFn: () => customFetcher(`${BASE_URL}/${snapshot.UI.currentPlaylistId}/tracks`),
        enabled: !!snapshot.UI.currentPlaylistId,
        staleTime: 1000 * 60 * 10,
    })

    const deleteTracksFromPlaylistMutation = useMutation({
        mutationFn: async (trackIds: string[]) => {
            return customFetcher(`${BASE_URL}/${snapshot.UI.currentPlaylistId}/tracks`, {
                method: 'DELETE',
                body: JSON.stringify({ trackIds }),
            })
        },
        onMutate: async (trackIds) => {
            await queryClient.cancelQueries({ queryKey: dynamicQueryKey })

            const previousTracks = queryClient.getQueryData<Track[]>(dynamicQueryKey)

            queryClient.setQueryData<Track[]>([...dynamicQueryKey, snapshot.UI.currentPlaylistId], (old = []) =>
                old.filter((track) => !trackIds.includes(track.id)),
            )

            return { previousTracks }
        },
        onError: (error, trackIds, context) => {
            if (context?.previousTracks) {
                queryClient.setQueryData([...dynamicQueryKey, snapshot.UI.currentPlaylistId], context.previousTracks)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [...dynamicQueryKey, snapshot.UI.currentPlaylistId] })
        },
    })

    return {
        playlistsQuery: playlistsQuery.data,
        isLoadingPlaylists: playlistsQuery.isLoading,
        errorPlaylists: playlistsQuery.error,
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
