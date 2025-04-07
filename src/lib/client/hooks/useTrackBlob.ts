import { getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/indexedDB'
import { useIsMember } from '@/lib/client/hooks/useIsMember'
import { useCallback } from 'react'
import { getTrackDownloadUrl } from '@/app/main/_actions/track'

export const useTrackBlob = () => {
    const { isMember } = useIsMember()

    const getTrackBlobUrl = useCallback(
        async (id: string): Promise<Blob> => {
            const blob = await getTrackFromIndexedDB(id)
            if (blob) {
                return blob
            } else {
                if (isMember) {
                    const { data, success, message } = await getTrackDownloadUrl(id)

                    if (!data || !success) {
                        throw new Error(message || 'Failed to fetch track presigned URL')
                    }

                    const fileResponse = await fetch(data.presignedUrl)
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
    return { getTrackBlobUrl }
}
