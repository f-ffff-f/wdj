import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreatePlaylistAPI, DeletePlaylistAPI, GetPlaylistsAPI, UpdatePlaylistAPI } from '@/app/types/api'
import { fetcher } from '@/app/_lib/queryClient/fetcher'

/**
 * 플레이리스트 관련 커스텀 훅
 */
export const usePlaylist = () => {
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

    return {
        playlists: playlistsQuery.data,
        isLoading: playlistsQuery.isLoading,
        error: playlistsQuery.error,
        createPlaylist: createPlaylistMutation.mutate,
        isCreating: createPlaylistMutation.isPending,
        updatePlaylist: updatePlaylistMutation.mutate,
        isUpdating: updatePlaylistMutation.isPending,
        deletePlaylist: deletePlaylistMutation.mutate,
        isDeleting: deletePlaylistMutation.isPending,
    }
}
