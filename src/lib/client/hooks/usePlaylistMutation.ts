import { createPlaylist, deletePlaylist, updatePlaylist } from '@/app/main/_actions/playlist'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { TServerActionResponse } from '@/lib/shared/types'
import { Playlist } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

/**
 * 플레이리스트 서버 액션을 사용하는 뮤테이션 훅
 */
export const usePlaylistMutation = () => {
    const { playlistId } = useParams<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>()

    const queryClient = useQueryClient()

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => createPlaylist(name),
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey: ['playlists', playlistId] })

            const previousPlaylists = queryClient.getQueryData<TServerActionResponse<Playlist[]>>([
                'playlists',
                playlistId,
            ])

            const tempId = `temp-${Date.now()}`

            if (previousPlaylists) {
                const newPlaylist: Playlist = {
                    id: tempId,
                    name,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: '', // 실제 값은 서버에서 설정됨
                }

                queryClient.setQueryData<TServerActionResponse<Playlist[]>>(['playlists', playlistId], {
                    data: [newPlaylist, ...(previousPlaylists.data ?? [])],
                    success: true,
                })
            }

            return { previousPlaylists }
        },
        onError: (error, na_, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(['playlists', playlistId], context.previousPlaylists)
            }
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', playlistId] })
        },
    })

    /**
     * 플레이리스트 수정 뮤테이션
     */
    const updatePlaylistMutation = useMutation({
        mutationFn: async (params: { id: string; name: string }) => updatePlaylist(params.id, params.name),
        onMutate: async (params) => {
            await queryClient.cancelQueries({ queryKey: ['playlists'] })
            const previousPlaylists = queryClient.getQueryData<TServerActionResponse<Playlist[]>>(['playlists'])

            if (previousPlaylists) {
                queryClient.setQueryData<TServerActionResponse<Playlist[]>>(['playlists'], {
                    data: previousPlaylists.data?.map((playlist) =>
                        playlist.id === params.id
                            ? { ...playlist, name: params.name, updatedAt: new Date() }
                            : playlist,
                    ),
                    success: true,
                })
            }

            return { previousPlaylists }
        },
        onError: (error, para_, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(['playlists'], context.previousPlaylists)
            }
            alert(error)
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
            const previousPlaylists = queryClient.getQueryData<TServerActionResponse<Playlist[]>>(['playlists'])

            if (previousPlaylists) {
                queryClient.setQueryData<TServerActionResponse<Playlist[]>>(['playlists'], {
                    data: previousPlaylists.data?.filter((playlist) => playlist.id !== id) ?? [],
                    success: true,
                })
            }

            return { previousPlaylists }
        },
        onError: (error, _, context) => {
            if (context?.previousPlaylists) {
                queryClient.setQueryData(['playlists'], context.previousPlaylists)
            }
            alert(error)
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
