import { customFetcher } from '@/lib/client/utils/customFetcher'
import { useCurrentUser } from '@/lib/client/hooks/useCurrentUser'
import { deleteTrackFromIndexedDB, getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/db/indexedDB'
import { state } from '@/lib/client/state'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'
import { Track } from '@prisma/client'
import { handleClientError } from '@/lib/client/utils/handleClientError'
import { useCallback } from 'react'

export const useTrack = () => {
    const { isMember } = useCurrentUser()
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()
    const queryKey = ['/api/tracks']

    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey,
        queryFn: () => customFetcher('/api/tracks'),
        retry: false,
        staleTime: 1000 * 60 * 10,
    })

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation<Track, Error, File>({
        mutationFn: async (file: File) => {
            // 1. db 저장 요청
            const playlistId = snapshot.UI.currentPlaylistId

            const response = await customFetcher('/api/tracks/create', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: file.name,
                    playlistId,
                }),
            })

            setTrackToIndexedDB(response.id, file)

            if (isMember) {
                // 2. 프리사인드 URL 요청
                const presignedResponse = await customFetcher('/api/upload/presigned-url', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: response.id,
                        fileName: response.fileName,
                        fileType: file.type,
                    }),
                })

                // 3. S3에 파일 업로드
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
            }

            return response
        },
        onError: (error) => {
            alert(error)
        },
        onSuccess: (response) => {
            state.UI.focusedTrackId = response.id
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
            queryClient.invalidateQueries({ queryKey: ['/api/playlist', snapshot.UI.currentPlaylistId] })
        },
    })

    // 트랙 삭제 뮤테이션
    const deleteTrackMutation = useMutation({
        mutationFn: async (id: string) => {
            deleteTrackFromIndexedDB(id)

            if (isMember) {
                return customFetcher(`/api/tracks/${id}/delete`, {
                    method: 'DELETE',
                })
            }
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey })

            const previousTracks = queryClient.getQueryData<Track[]>(queryKey)
            queryClient.setQueryData<Track[]>(queryKey, (old = []) => old.filter((track) => track.id !== id))

            return { previousTracks }
        },
        onError: (error, id, context) => {
            queryClient.setQueryData(queryKey, context?.previousTracks)
            alert(error)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
        },
    })

    // 모든 트랙 삭제
    const deleteAllTracksMutation = useMutation({
        mutationFn: async () => {
            return customFetcher('/api/tracks/delete', {
                method: 'DELETE',
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey })
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
                    const response = await customFetcher(`/api/tracks/${id}/presigned-url`, {
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
