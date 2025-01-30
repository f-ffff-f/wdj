import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateTrackAPI, DeleteTrackAPI, GetTracksAPI } from '@/app/types/api'
import { fetcher } from '@/app/_lib/queryClient/fetcher'
import { useCurrentUser } from '@/app/_lib/hooks/useCurrentUser'
import { useSnapshot } from 'valtio'
import { state, valtioAction } from '@/app/_lib/state'

/**
 * 트랙 관리 커스텀 훅
 * 인증 상태에 따라 서버 API 또는 로컬 상태 사용
 */
export const useTrack = () => {
    const snapshot = useSnapshot(state)
    const { isAuthenticated } = useCurrentUser()

    const queryClient = useQueryClient()
    const queryKey = ['/api/track']

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<GetTracksAPI['Response']>({
        queryKey,
        queryFn: () => fetcher('/api/track'),
        retry: false,
    })

    const tracks = isAuthenticated ? tracksQuery.data : snapshot.guest.tracks

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation({
        mutationFn: async (file: File) => {
            // 1. S3 업로드 로직 (가정)
            const s3Url = 'testurl' // 실제 구현 필요

            // [추가] playlistId 가져오기
            const playlistId = snapshot.UI.currentPlaylistId

            // 2. 메타데이터 API 전송
            return fetcher('/api/track/create', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: file.name,
                    url: s3Url,
                    // [추가] playlistId가 있으면 넘겨줌
                    playlistId,
                }),
            }) as Promise<CreateTrackAPI['Response']>
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId] })
        },
    })

    const createTrack = isAuthenticated ? createTrackMutation.mutate : valtioAction.addTrackToLibrary

    // 트랙 삭제 뮤테이션
    const deleteTrackMutation = useMutation({
        mutationFn: async (id: string) => {
            return fetcher(`/api/track/${id}/delete`, {
                method: 'DELETE',
            }) as Promise<DeleteTrackAPI['Response']>
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey })

            const previousTracks = queryClient.getQueryData<GetTracksAPI['Response']>(queryKey)
            queryClient.setQueryData<GetTracksAPI['Response']>(queryKey, (old = []) =>
                old.filter((track) => track.id !== id),
            )

            return { previousTracks }
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(queryKey, context?.previousTracks)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    const deleteTrack = isAuthenticated ? deleteTrackMutation.mutate : valtioAction.deleteTrackFromLibrary

    return {
        tracks,
        isLoading: tracksQuery.isLoading,
        error: tracksQuery.error,
        createTrack,
        isCreating: createTrackMutation.isPending,
        deleteTrack,
        isDeleting: deleteTrackMutation.isPending,
    }
}
