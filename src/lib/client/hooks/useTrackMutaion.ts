import { deleteTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/db/indexedDB'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { state } from '@/lib/client/state'
import { Track } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTrack, getTrackPresignedUrl, deleteTrack, deleteAllTracksDB } from '@/app/main/_actions/track'
import { useParams } from 'next/navigation'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'

/**
 * 트랙 서버 액션을 사용하는 뮤테이션 훅
 */
export const useTrackMutation = () => {
    const { isMember } = useClientAuth()
    const { playlistId } = useParams<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>()
    const queryClient = useQueryClient()

    // 트랙 생성 뮤테이션
    const createTrackMutation = useMutation({
        mutationFn: async (file: File) => {
            // FormData 객체 생성
            const formData = new FormData()
            formData.append('fileName', file.name)

            // URL에서 현재 플레이리스트 ID 사용
            // 기본 플레이리스트(라이브러리)가 아닌 경우에만 플레이리스트 ID 전송
            if (playlistId && playlistId !== PLAYLIST_DEFAULT_ID) {
                formData.append('playlistId', playlistId)
            }

            // 1. 서버 액션으로 트랙 생성
            const { success, data: track } = await uploadTrack(formData)

            if (!track || !success) {
                throw new Error('Failed to create track')
            }

            // 2. IndexedDB에 파일 저장
            await setTrackToIndexedDB(track.id, file)

            // 3. UI 상태 업데이트
            state.UI.focusedTrackId = track.id

            // 4. 캐시 업데이트 - 트랙 리스트 및 현재 플레이리스트
            // TrackList.tsx에서 사용하는 쿼리 키 형식 ['tracks']
            queryClient.invalidateQueries({ queryKey: ['tracks', playlistId] })

            // 5. 멤버인 경우 S3 업로드 진행
            if (isMember) {
                try {
                    // 프리사인드 URL 요청
                    const { data: presignedUrlData } = await getTrackPresignedUrl(track.id, track.fileName, file.type)

                    if (!presignedUrlData) {
                        throw new Error('Failed to get presigned url')
                    }

                    // S3에 파일 업로드
                    const uploadResponse = await fetch(presignedUrlData.url, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type,
                        },
                    })

                    if (!uploadResponse.ok) {
                        throw new Error('Failed to upload track to S3')
                    }
                } catch (error) {
                    throw new Error('Background S3 upload failed')
                }
            }

            return track
        },
        onError: (error) => {
            console.error('Track creation error:', error)
            alert(error.message || 'Failed to create track')
        },
    })

    // 트랙 삭제 뮤테이션
    const deleteTrackMutation = useMutation({
        mutationFn: async (id: string) => {
            // 1. IndexedDB에서 트랙 삭제
            deleteTrackFromIndexedDB(id)

            // 2. 서버 액션으로 트랙 삭제
            return deleteTrack(id)
        },
        onMutate: async (id) => {
            // 낙관적 업데이트 시작 - TrackList.tsx의 쿼리 키 형식 사용
            await queryClient.cancelQueries({ queryKey: ['tracks', playlistId] })

            // 이전 데이터 저장
            const previousTracks = queryClient.getQueryData<Track[]>(['tracks', playlistId])

            // 캐시 업데이트
            queryClient.setQueryData<Track[]>(['tracks', playlistId], (old = []) =>
                old.filter((track) => track.id !== id),
            )

            return { previousTracks }
        },
        onError: (error, id, context) => {
            // 에러 발생 시 원래 데이터로 복원
            queryClient.setQueryData(['tracks', playlistId], context?.previousTracks)
            console.error('Track deletion error:', error)
            alert('Failed to delete track')
        },
        onSettled: () => {
            // 작업 완료 후 캐시 무효화하여 최신 데이터 요청
            queryClient.invalidateQueries({ queryKey: ['tracks', playlistId] })
        },
    })

    // DB에서만 모든 트랙 삭제
    const deleteAllTracksDBMutation = useMutation({
        mutationFn: async () => {
            // 서버 액션으로 모든 트랙 삭제
            return deleteAllTracksDB()
        },
        onMutate: async () => {
            // 관련 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['tracks', playlistId] })

            // 이전 데이터 저장
            const previousTracks = queryClient.getQueryData<Track[]>(['tracks', playlistId])

            // 낙관적으로 캐시 비우기
            queryClient.setQueryData<Track[]>(['tracks', playlistId], [])

            return { previousTracks }
        },
        onError: (error, _, context) => {
            // 에러 발생 시 원래 데이터로 복원
            queryClient.setQueryData(['tracks', playlistId], context?.previousTracks)
            console.error('All tracks deletion error:', error)
            alert('Failed to delete all tracks')
        },
        onSettled: () => {
            // 작업 완료 후 캐시 무효화하여 최신 데이터 요청
            queryClient.invalidateQueries({ queryKey: ['tracks', playlistId] })
        },
    })

    return { createTrackMutation, deleteTrackMutation, deleteAllTracksDBMutation }
}
