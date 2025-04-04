import { getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/indexedDB'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { useCallback } from 'react'
import { getTrackDownloadUrl } from '@/app/main/_actions/track'

export const useTrackBlob = () => {
    const { isMember } = useClientAuth()

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
