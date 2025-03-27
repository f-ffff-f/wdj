import { deleteTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/db/indexedDB'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { state } from '@/lib/client/state'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { handleClientError } from '@/lib/client/utils/handleClientError'
import { Track } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnapshot } from 'valtio'

const API = '/api'
const TRACK = '/tracks'
const QUERY_KEY = [API, TRACK]

export const useTrackMutation = () => {
    const { isMember } = useClientAuth()
    const snapshot = useSnapshot(state)

    const queryClient = useQueryClient()

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation<Track, Error, File>({
        mutationFn: async (file: File) => {
            // 1. db 저장 요청
            const playlistId = snapshot.UI.currentPlaylistId

            const response = await customFetcher(`${API}/${TRACK}/create`, {
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

            return customFetcher(`${API}/${TRACK}/${id}/delete`, {
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
            return customFetcher(`${API}/${TRACK}/delete`, {
                method: 'DELETE',
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        },
    })

    return { createTrackMutation, deleteTrackMutation, deleteAllTracksMutation }
}
