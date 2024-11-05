// /src/components/Crossfader.tsx
import React from 'react'
import { useSnapshot } from 'valtio'
import { consoleState } from '@/app/_lib/consoleState'

const Crossfader: React.FC = () => {
    const consoleSnap = useSnapshot(consoleState)

    const handleCrossfadeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        consoleState.crossfadeValue = parseFloat(event.target.value)
    }

    return (
        <div className="flex flex-col items-center mt-6">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={consoleSnap.crossfadeValue}
                onChange={handleCrossfadeChange}
            />
        </div>
    )
}

export default Crossfader
