import { state } from '@/lib/client/state'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Track } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'

const API = '/api'
const TRACK = '/tracks'
const TRACK_QUERY_KEY = [API, TRACK]

const PLAYLIST = '/playlist'

export const useTrackQuery = () => {
    const currentPlaylistId = useSnapshot(state).UI.currentPlaylistId

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey: TRACK_QUERY_KEY,
        queryFn: () => customFetcher(`${API}/${TRACK}`),
    })

    const playlistTracksQuery = useQuery<Track[]>({
        queryKey: [API, PLAYLIST, currentPlaylistId],
        queryFn: () => customFetcher(`${API}/${PLAYLIST}/${currentPlaylistId}/tracks`),
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
