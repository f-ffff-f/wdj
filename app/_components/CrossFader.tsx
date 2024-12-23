// /src/components/Crossfader.tsx
import React from 'react'
import { useSnapshot } from 'valtio'
import { controlState } from '@/app/_lib/controlState'

const Crossfader: React.FC = () => {
    const controlSnap = useSnapshot(controlState)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        controlState.crossfadeValue = parseFloat(event.target.value)
    }

    return (
        <div className="flex flex-col items-center mt-6">
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={controlSnap.crossfadeValue}
                onChange={handleChange}
            />
        </div>
    )
}

export default Crossfader
