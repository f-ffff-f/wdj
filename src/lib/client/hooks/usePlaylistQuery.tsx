import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Playlist } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

const PLAYLIST_BASE_URL = '/api/playlist'
const PLAYLIST_QUERY_KEY = [PLAYLIST_BASE_URL]

export const usePlaylistQuery = () => {
    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: PLAYLIST_QUERY_KEY,
        queryFn: () => customFetcher(PLAYLIST_BASE_URL),
    })

    return {
        playlistsQuery: playlistsQuery.data,
        isLoadingPlaylists: playlistsQuery.isLoading,
        errorPlaylists: playlistsQuery.error,
    }
}
