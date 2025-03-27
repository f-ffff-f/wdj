'use client'

import { Button } from '@/components/ui/button'
import { DialogDescription } from '@/components/ui/dialog'
import { clearAllTracksFromIndexedDB } from '@/lib/client/db/indexedDB'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { state, updateStorageEstimate } from '@/lib/client/state'
import { Trash } from 'lucide-react'
import { useEffect } from 'react'
import { useSnapshot } from 'valtio'

const StorageIndicator = () => {
    const storageEstimate = useSnapshot(state).UI.storageEstimate
    const { isMember } = useClientAuth()
    const { deleteAllTracksMutation } = useTrackMutation()

    const handleClearAllTracksFromIndexedDB = async () => {
        if (isMember) {
            await clearAllTracksFromIndexedDB()
        } else {
            if (
                confirm(
                    'You are a guest user, so all tracks info stored on our server will be deleted as well. Continue?',
                )
            ) {
                await clearAllTracksFromIndexedDB()
                deleteAllTracksMutation.mutate()
            }
        }
    }

    useEffect(() => {
        updateStorageEstimate()
    }, [])

    const getUsageValueString = () => {
        let number = 0
        if (storageEstimate?.usage) {
            number = Number((storageEstimate.usage / (1024 * 1024)).toFixed(1))
        }
        if (number < 1) {
            number = 0
        }

        return `${number}MB`
    }

    return (
        <DialogDescription className="flex items-center">
            {`This app is using ${getUsageValueString()} of storage`}
            <Button size="icon" variant="ghost" onClick={handleClearAllTracksFromIndexedDB} title="Clear all">
                <Trash />
                <span className="sr-only">Clear all</span>
            </Button>
        </DialogDescription>
    )
}

export default StorageIndicator
