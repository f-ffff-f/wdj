import { useCurrentUser } from '@/app/_lib/hooks/useCurrentUser'
import { useTrack } from '@/app/_lib/hooks/useTrack'
import { clearAllTracksFromIndexedDB } from '@/app/_lib/indexedDB'
import { state, updateStorageEstimate } from '@/app/_lib/state'
import { Button } from '@/components/ui/button'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import { Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

const Indicator = () => {
    const snapshot = useSnapshot(state)
    const { data, isMember } = useCurrentUser()
    const { deleteAllTracks } = useTrack()

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
                deleteAllTracks()
            }
        }
    }

    useEffect(() => {
        updateStorageEstimate()
    }, [])

    const getUsageValueString = () => {
        let number = 0
        if (snapshot.UI.storageEstimate?.usage) {
            number = Number((snapshot.UI.storageEstimate.usage / (1024 * 1024)).toFixed(1))
        }
        if (number < 1) {
            number = 0
        }

        return `${number}MB`
    }

    return (
        <div>
            <SidebarGroupLabel>
                {`This app is using ${getUsageValueString()} of storage`}
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleClearAllTracksFromIndexedDB}
                    title="Clear all"
                >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Clear all</span>
                </Button>
            </SidebarGroupLabel>
        </div>
    )
}

export default Indicator
