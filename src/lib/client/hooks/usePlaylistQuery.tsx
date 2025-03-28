import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Playlist } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { API_PLAYLISTS, QUERY_KEYS } from '@/lib/client/constants/endpoints'

export const usePlaylistQuery = () => {
    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: QUERY_KEYS.PLAYLIST,
        queryFn: () => customFetcher(API_PLAYLISTS),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    return {
        playlistsQuery: playlistsQuery.data,
        isLoadingPlaylists: playlistsQuery.isLoading,
        errorPlaylists: playlistsQuery.error,
    }
}
