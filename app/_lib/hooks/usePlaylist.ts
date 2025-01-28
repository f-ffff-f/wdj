import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreatePlaylistAPI } from '@/app/types/api'

/**
 * 플레이리스트 관련 커스텀 훅
 */
export const usePlaylist = () => {
    const queryClient = useQueryClient()

    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery({
        queryKey: ['/api/playlist'],
    })

    /**
     * 플레이리스트 생성 뮤테이션
     */
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await fetch('/api/playlist/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            })

            if (!response.ok) {
                throw new Error('플레이리스트 생성 실패')
            }
            return response.json() as Promise<CreatePlaylistAPI['Response']>
        },
        onSuccess: () => {
            // 플레이리스트 생성 성공 시 플레이리스트 목록 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] })
        },
    })

    return {
        playlists: playlistsQuery.data,
        isLoading: playlistsQuery.isLoading,
        error: playlistsQuery.error,
        createPlaylist: createPlaylistMutation.mutate,
        isCreating: createPlaylistMutation.isPending,
    }
}
