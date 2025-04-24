import { getTrackFromIndexedDB, setTrackToIndexedDB } from '@/lib/client/indexedDB'
import { useCallback } from 'react'
import { getTrackDownloadUrl } from '@/app/main/_actions/track'
import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'

export const useTrackBlob = () => {
    const { data: session } = useSession()

    const getTrackBlobUrl = useCallback(
        async (id: string): Promise<Blob | void> => {
            try {
                const blob = await getTrackFromIndexedDB(id)
                if (blob) {
                    return blob
                } else {
                    if (session?.user?.role === Role.MEMBER) {
                        const { data: presignedUrl } = await getTrackDownloadUrl(id)

                        if (!presignedUrl) {
                            throw new Error('Failed to fetch track presigned URL')
                        }

                        const fileResponse = await fetch(presignedUrl)
                        const blob = await fileResponse.blob()

                        setTrackToIndexedDB(id, blob)

                        return blob
                    } else {
                        throw new Error('Track not found')
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    alert(error.message)
                } else {
                    alert('Failed to get track blob')
                }
            }
        },
        [session?.user?.role],
    )
    return { getTrackBlobUrl }
}
