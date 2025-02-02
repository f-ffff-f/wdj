import { fetchWithToken } from '@/app/_lib/auth/fetchWithToken'
import { state } from '@/app/_lib/state'
import { DeleteTrackAPI, GetTracksAPI } from '@/app/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'

/**
 * 트랙 관리 커스텀 훅
 * 인증 상태에 따라 서버 API 또는 로컬 상태 사용
 */
export const useTrack = () => {
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()
    const queryKey = ['/api/track']

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<GetTracksAPI['Response']>({
        queryKey,
        queryFn: () => fetchWithToken('/api/track'),
        retry: false,
    })

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation({
        mutationFn: async (file: File) => {
            try {
                // 1. 프리사인드 URL 요청
                const presignedResponse = await fetchWithToken('/api/upload/presigned-url', {
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

                return await fetchWithToken('/api/track/create', {
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
        onSuccess: (data) => {
            state.UI.focusedTrackId = data.id
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId] })
        },
    })

    // 트랙 삭제 뮤테이션
    const deleteTrackMutation = useMutation({
        mutationFn: async (id: string) => {
            return fetchWithToken(`/api/track/${id}/delete`, {
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

    // 단일 트랙의 blob url | presigned URL 가져오기 함수
    const getTrackUrl = async (id: string): Promise<string> => {
        const data = await fetchWithToken(`/api/track/${id}/get`, {
            method: 'GET',
        })

        if (data.error) {
            throw new Error('Failed to fetch track presigned URL')
        }

        return data.presignedUrl
    }

    return {
        tracksQuery: tracksQuery.data,
        isLoading: tracksQuery.isLoading,
        error: tracksQuery.error,
        createTrack: createTrackMutation.mutate,
        isCreating: createTrackMutation.isPending,
        deleteTrack: deleteTrackMutation.mutate,
        isDeleting: deleteTrackMutation.isPending,
        getTrackUrl,
    }
}
