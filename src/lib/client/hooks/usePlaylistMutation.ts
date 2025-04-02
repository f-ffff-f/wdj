import { customFetcher } from '@/lib/client/utils/customFetcher'
import { state } from '@/lib/client/state'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { Playlist, Track } from '@prisma/client'
import { API_PLAYLISTS, QUERY_KEYS } from '@/lib/client/constants/endpoints'
import { useParams } from 'next/navigation'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'

/**
 * 플레이리스트 서버 액션을 사용하는 뮤테이션 훅
 */
export const usePlaylistMutation = () => {
    const { playlistId: routePlaylistId } = useParams<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>()

    const queryClient = useQueryClient()

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            return customFetcher(`${API_PLAYLISTS}/create`, {
                method: 'POST',
                body: JSON.stringify({ name }),
            })
        },
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PLAYLIST })

            const previousPlaylists = queryClient.getQueryData<Playlist[]>(QUERY_KEYS.PLAYLIST)

            const tempId = `temp-${Date.now()}`

            if (previousPlaylists) {
                const newPlaylist: Playlist = {
                    id: tempId,
                    name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: '', // 실제 값은 서버에서 설정됨
                }

                queryClient.setQueryData<Playlist[]>(QUERY_KEYS.PLAYLIST, [newPlaylist, ...previousPlaylists])
            }

            return { previousPlaylists }
        },
        onError: (error, name, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(QUERY_KEYS.PLAYLIST, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async (params: { id: string; name: string }) => {
            return customFetcher(`${API_PLAYLISTS}/${params.id}/update`, {
                method: 'PATCH',
                body: JSON.stringify({ name: params.name }),
            })
        },
        onMutate: async (params) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PLAYLIST })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(QUERY_KEYS.PLAYLIST)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    QUERY_KEYS.PLAYLIST,
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
                queryClient.setQueryData(QUERY_KEYS.PLAYLIST, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST })
        },
    })

    /**
     * 플레이리스트 삭제 뮤테이션
     */
    const deletePlaylistMutation = useMutation({
        mutationFn: async (id: string) => {
            return customFetcher(`${API_PLAYLISTS}/${id}/delete`, {
                method: 'DELETE',
            })
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PLAYLIST })
            const previousPlaylists = queryClient.getQueryData<Playlist[]>(QUERY_KEYS.PLAYLIST)

            if (previousPlaylists) {
                queryClient.setQueryData<Playlist[]>(
                    QUERY_KEYS.PLAYLIST,
                    previousPlaylists.filter((playlist) => playlist.id !== id),
                )
            }

            return { previousPlaylists }
        },
        onError: (error, id, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(QUERY_KEYS.PLAYLIST, context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST })
        },
    })

    const addTracksToPlaylistMutation = useMutation<Playlist, Error, { id: string; trackIds: string[] }>({
        mutationFn: async ({ id, trackIds }) => {
            return customFetcher(`${API_PLAYLISTS}/${id}/tracks`, {
                method: 'POST',
                body: JSON.stringify({ trackIds }),
            })
        },
        onSettled: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYLIST[0], QUERY_KEYS.PLAYLIST[1], data.id] })
            }
        },
        onError: (error) => {
            alert(error)
        },
    })

    const deleteTracksFromPlaylistMutation = useMutation({
        mutationFn: async (trackIds: string[]) => {
            return customFetcher(`${API_PLAYLISTS}/${routePlaylistId}/tracks`, {
                method: 'DELETE',
                body: JSON.stringify({ trackIds }),
            })
        },
        onMutate: async (trackIds) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.PLAYLIST })

            const previousTracks = queryClient.getQueryData<Track[]>(QUERY_KEYS.PLAYLIST)

            queryClient.setQueryData<Track[]>(QUERY_KEYS.PLAYLIST, (old = []) =>
                old.filter((track) => !trackIds.includes(track.id)),
            )

            return { previousTracks }
        },
        onError: (error, trackIds, context) => {
            if (context?.previousTracks) {
                queryClient.setQueryData(QUERY_KEYS.PLAYLIST, context.previousTracks)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLAYLIST })
        },
    })

    return {
        createPlaylistMutation,
        updatePlaylistMutation,
        deletePlaylistMutation,
        addTracksToPlaylistMutation,
        deleteTracksFromPlaylistMutation,
    }
}
