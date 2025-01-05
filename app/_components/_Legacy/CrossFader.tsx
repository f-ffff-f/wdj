import { useControl } from '@/app/_hooks/useControl'
import { store } from '@/app/_lib/store'
import React from 'react'
import { useSnapshot } from 'valtio'

const CrossFader = ({
    crossFade,
    audioContext,
}: {
    crossFade: {
        a: React.MutableRefObject<GainNode | null>
        b: React.MutableRefObject<GainNode | null>
    }
    audioContext: AudioContext
}) => {
    const snapshot = useSnapshot(store)
    const { setCrossFade } = useControl(audioContext)

    const handleCrossFade = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value)
        store.controller.crossfade.value = value
    }

    return (
        <div className="flex flex-col items-center mt-8">
            <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Deck A</span>
                    <span>Deck B</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={snapshot.controller.crossfade.value}
                    onChange={(e) => setCrossFade(Number(e.target.value), crossFade)}
                    className="w-full"
                />
                <div className="text-center">
                    <span className="text-sm">
                        크로스페이더: {(snapshot.controller.crossfade.value * 100).toFixed(0)}%
                    </span>
                </div>
            </div>
        </div>
    )
}

export default CrossFader
