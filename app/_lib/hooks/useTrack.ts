import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeleteTrackAPI, GetTracksAPI } from '@/app/types/api'
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
            try {
                // 1. 프리사인드 URL 요청
                const presignedResponse = await fetcher('/api/upload/presigned-url', {
                    method: 'POST',
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                    }),
                })

                // 2. S3에 파일 업로드
                const uploadResponse = await fetch(presignedResponse.url, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                })

                if (!uploadResponse.ok) throw new Error('S3 upload failed')

                // 3. 메타데이터 저장 요청
                const playlistId = snapshot.UI.currentPlaylistId
                const s3Url = presignedResponse.url.split('?')[0]

                return await fetcher('/api/track/create', {
                    method: 'POST',
                    body: JSON.stringify({
                        fileName: file.name,
                        url: s3Url,
                        playlistId,
                    }),
                })
            } catch (error) {
                throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
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
