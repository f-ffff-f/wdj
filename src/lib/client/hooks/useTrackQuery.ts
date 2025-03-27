import { state } from '@/lib/client/state'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Track } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'

const TRACK_BASE_URL = '/api/tracks'
const TRACK_QUERY_KEY = [TRACK_BASE_URL]

const PLAYLIST_BASE_URL = '/api/playlist'

export const useTrackQuery = () => {
    const currentPlaylistId = useSnapshot(state).UI.currentPlaylistId

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey: TRACK_QUERY_KEY,
        queryFn: () => customFetcher(TRACK_BASE_URL),
        staleTime: 1000 * 60 * 10,
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: [PLAYLIST_BASE_URL, currentPlaylistId],
        queryFn: () => customFetcher(`${PLAYLIST_BASE_URL}/${currentPlaylistId}/tracks`),
        enabled: currentPlaylistId !== '',
        staleTime: 1000 * 60 * 10,
    })

    return {
        tracksQuery: tracksQuery.data,
        isLoading: tracksQuery.isLoading,
        error: tracksQuery.error,
        playlistTracksQuery: playlistTracksQuery.data,
        isLoadingPlaylistTracks: playlistTracksQuery.isLoading,
        errorPlaylistTracks: playlistTracksQuery.error,
    }
}
