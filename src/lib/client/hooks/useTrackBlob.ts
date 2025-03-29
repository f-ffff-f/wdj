import { getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/db/indexedDB'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { customFetcher } from '@/lib/client/utils/customFetcher'
import { useCallback } from 'react'

const BASE_URL = '/api/tracks'

export const useTrackBlob = () => {
    const { isMember } = useClientAuth()

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
    return { getTrackBlobUrl }
}
