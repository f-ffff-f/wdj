import { createPlaylist, deletePlaylist, updatePlaylist } from '@/app/main/_actions/playlist'
import { AppResponse } from '@/lib/shared/types'
import { Playlist } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

/**
 * 플레이리스트 서버 액션을 사용하는 뮤테이션 훅
 */
export const usePlaylistMutation = () => {
    const queryClient = useQueryClient()

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => createPlaylist(name),
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey: ['playlists'] })

            const previousPlaylists = queryClient.getQueryData<AppResponse<Playlist[]>>(['playlists'])

            const tempId = `temp-${Date.now()}`

            if (previousPlaylists) {
                const newPlaylist: Playlist = {
                    id: tempId,
                    name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: '', // 실제 값은 서버에서 설정됨
                }

                queryClient.setQueryData<AppResponse<Playlist[]>>(['playlists'], {
                    ...previousPlaylists,
                    data: [newPlaylist, ...(previousPlaylists.data || [])],
                })
            }

            return { previousPlaylists }
        },
        onError: (error, na_, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(['playlists'], context.previousPlaylists)
            }
            alert(error.message || 'Failed to create playlist')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async (params: { id: string; name: string }) => updatePlaylist(params.id, params.name),
        onMutate: async (params) => {
            await queryClient.cancelQueries({ queryKey: ['playlists'] })
            const previousPlaylists = queryClient.getQueryData<AppResponse<Playlist[]>>(['playlists'])

            if (previousPlaylists?.data) {
                queryClient.setQueryData<AppResponse<Playlist[]>>(['playlists'], {
                    ...previousPlaylists,
                    data: previousPlaylists.data.map((playlist) =>
                        playlist.id === params.id
                            ? { ...playlist, name: params.name, updatedAt: new Date() }
                            : playlist,
                    ),
                })
            }

            return { previousPlaylists }
        },
        onError: (error, para_, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(['playlists'], context.previousPlaylists)
            }
            alert(error.message || 'Failed to update playlist')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
    })

    /**
     * 플레이리스트 삭제 뮤테이션
     */
    const deletePlaylistMutation = useMutation({
        mutationFn: async (id: string) => deletePlaylist(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['playlists'] })
            const previousPlaylists = queryClient.getQueryData<AppResponse<Playlist[]>>(['playlists'])

            if (previousPlaylists?.data) {
                queryClient.setQueryData<AppResponse<Playlist[]>>(['playlists'], {
                    ...previousPlaylists,
                    data: previousPlaylists.data.filter((playlist) => playlist.id !== id),
                })
            }

            return { previousPlaylists }
        },
        onError: (error, _, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData<AppResponse<Playlist[]>>(['playlists'], context.previousPlaylists)
            }
            alert(error.message || 'Failed to delete playlist')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
        },
    })

    return {
        createPlaylistMutation,
        updatePlaylistMutation,
        deletePlaylistMutation,
    }
}
