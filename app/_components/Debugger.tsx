import React, { useEffect, useState } from 'react'
import { audioManager } from '@/app/_lib/audioManager/audioManagerSingleton'

const Debugger: React.FC = () => {
    const [state, setState] = useState<string>('')

    useEffect(() => {
        const interval = setInterval(() => {
            setState((prev) => audioManager.debugManager())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return <pre className="whitespace-pre-wrap text-xs p-4 text-gray-500">{state}</pre>
}

export default Debugger
