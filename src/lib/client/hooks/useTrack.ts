import { customFetcher } from '@/lib/client/utils/customFetcher'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { deleteTrackFromIndexedDB, getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/db/indexedDB'
import { state } from '@/lib/client/state'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { Track } from '@prisma/client'
import { handleClientError } from '@/lib/client/utils/handleClientError'
import { useCallback } from 'react'

const BASE_URL = '/api/tracks'
const QUERY_KEY = [BASE_URL]

export const useTrack = () => {
    const { isMember } = useClientAuth()
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey: QUERY_KEY,
        queryFn: () => customFetcher(BASE_URL),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation<Track, Error, File>({
        mutationFn: async (file: File) => {
            // 1. db 저장 요청
            const playlistId = snapshot.UI.currentPlaylistId

            const response = await customFetcher(`${BASE_URL}/create`, {
                method: 'POST',
                body: JSON.stringify({
                    fileName: file.name,
                    playlistId,
                }),
            })

            // Store in IndexedDB and make the track available immediately
            await setTrackToIndexedDB(response.id, file)

            // Update UI to focus on the new track immediately after IndexedDB storage
            state.UI.focusedTrackId = response.id

            // Invalidate queries to refresh UI with the new track
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
            queryClient.invalidateQueries({
                queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId],
            })

            if (isMember) {
                // 2. 프리사인드 URL 요청 - this happens in the background now
                try {
                    const presignedResponse = await customFetcher('/api/upload/presigned-url', {
                        method: 'POST',
                        body: JSON.stringify({
                            id: response.id,
                            fileName: response.fileName,
                            fileType: file.type,
                        }),
                    })

                    // 3. S3에 파일 업로드.
                    // 예외적으로 customFetcher 미사용
                    const uploadResponse = await fetch(presignedResponse.url, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type,
                        },
                    })

                    if (!uploadResponse.ok) {
                        await handleClientError(uploadResponse)
                    }
                } catch (error) {
                    // Log errors but don't prevent the function from returning
                    console.error('Background S3 upload failed:', error)
                    // We could add a state flag here to indicate upload status if needed
                }
            }

            return response
        },
        onError: (error) => {
            alert(error)
        },
    })

    // 트랙 삭제 뮤테이션
    const deleteTrackMutation = useMutation({
        mutationFn: async (id: string) => {
            deleteTrackFromIndexedDB(id)

            return customFetcher(`${BASE_URL}/${id}/delete`, {
                method: 'DELETE',
            })
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY })

            const previousTracks = queryClient.getQueryData<Track[]>(QUERY_KEY)
            queryClient.setQueryData<Track[]>(QUERY_KEY, (old = []) => old.filter((track) => track.id !== id))

            return { previousTracks }
        },
        onError: (error, id, context) => {
            queryClient.setQueryData(QUERY_KEY, context?.previousTracks)
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })

    // 모든 트랙 삭제
    const deleteAllTracksMutation = useMutation({
        mutationFn: async () => {
            return customFetcher(`${BASE_URL}/delete`, {
                method: 'DELETE',
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })

    // 단일 트랙의 blob | presigned URL => blob 가져오기 함수
    const getTrackBlobUrl = useCallback(
        async (id: string): Promise<Blob> => {
            const blob = await getTrackFromIndexedDB(id)
            if (blob) {
                return blob
            } else {
                if (isMember) {
                    const response = await customFetcher(`${BASE_URL}/${id}/presigned-url`, {
                        method: 'GET',
                    })

                    if (response.error) {
                        throw new Error('Failed to fetch track presigned URL')
                    }

                    const fileResponse = await fetch(response.presignedUrl)
                    const blob = await fileResponse.blob()

                    setTrackToIndexedDB(id, blob)

                    return blob
                } else {
                    throw new Error('Track not found')
                }
            }
        },
        [isMember],
    )

    return {
        tracksQuery: tracksQuery.data,
        isLoading: tracksQuery.isLoading,
        error: tracksQuery.error,
        createTrack: createTrackMutation.mutate,
        isCreating: createTrackMutation.isPending,
        deleteTrack: deleteTrackMutation.mutate,
        isDeleting: deleteTrackMutation.isPending,
        deleteAllTracks: deleteAllTracksMutation.mutate,
        isDeletingAllTracks: deleteAllTracksMutation.isPending,
        getTrackBlobUrl,
    }
}
