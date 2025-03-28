import { state } from '@/lib/client/state'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Track } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { API_TRACKS, API_PLAYLISTS, QUERY_KEYS } from '@/lib/client/constants/endpoints'

export const useTrackQuery = () => {
    const currentPlaylistId = useSnapshot(state).UI.currentPlaylistId

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey: QUERY_KEYS.TRACKS,
        queryFn: () => customFetcher(API_TRACKS),
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: [QUERY_KEYS.PLAYLIST, currentPlaylistId],
        queryFn: () => customFetcher(`${API_PLAYLISTS}/${currentPlaylistId}/tracks`),
        enabled: currentPlaylistId !== '',
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
