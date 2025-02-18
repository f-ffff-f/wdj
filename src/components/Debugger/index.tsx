import React, { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '@/lib/client/state'
import { deckoSingleton } from '@ghr95223/decko'

const Debugger: React.FC = () => {
    const [audioManagerState, setAudioManagerState] = useState<string>('')
    const snapshot = useSnapshot(state)

    useEffect(() => {
        const interval = setInterval(() => {
            setAudioManagerState(deckoSingleton.debugManager())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex whitespace-pre-wrap text-xs p-4 text-gray-500">
            <pre>{audioManagerState}</pre>
            <pre>{JSON.stringify(snapshot, null, 2)}</pre>
        </div>
    )
}

export default Debugger
