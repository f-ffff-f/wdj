import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Playlist } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

const API = '/api'
const PLAYLIST = '/playlist'
const QUERY_KEY = [API, PLAYLIST]

export const usePlaylistQuery = () => {
    /**
     * 플레이리스트 목록 조회 쿼리
     */
    const playlistsQuery = useQuery<Playlist[]>({
        queryKey: QUERY_KEY,
        queryFn: () => customFetcher(`${API}/${PLAYLIST}`),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    return {
        playlistsQuery: playlistsQuery.data,
        isLoadingPlaylists: playlistsQuery.isLoading,
        errorPlaylists: playlistsQuery.error,
    }
}
