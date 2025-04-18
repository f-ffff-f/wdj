'use client'

import { state } from '@/lib/client/state'
import React, { useDeferredValue, useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

import { myDeckoManager } from '@/lib/client/myDeckoManager'

const Debugger: React.FC = () => {
    const [audioManagerState, setAudioManagerState] = useState<string>('')
    const deferredAudioManagerState = useDeferredValue(audioManagerState)
    const snapshot = useSnapshot(state)

    useEffect(() => {
        const interval = setInterval(() => {
            setAudioManagerState(myDeckoManager.debugManager())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex whitespace-pre-wrap text-xs p-4 text-gray-500">
            <pre>{deferredAudioManagerState}</pre>
            <pre>{JSON.stringify(snapshot, null, 2)}</pre>
        </div>
    )
}

export default Debugger
