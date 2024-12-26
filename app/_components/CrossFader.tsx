import React from 'react'
import { useSnapshot } from 'valtio'
import * as Tone from 'tone'
import { store } from '@/app/_lib/store'

interface ICrossFaderProps {
    crossFadeRef: React.RefObject<Tone.CrossFade>
}

const CrossFader = ({ crossFadeRef }: ICrossFaderProps) => {
    const crossfadeSnap = useSnapshot(store.crossfade)

    // 크로스페이더 값 변경 처리
    const handleCrossFade = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value)
        store.crossfade.value = value

        if (crossFadeRef.current) {
            crossFadeRef.current.fade.value = value
        }
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
                    value={crossfadeSnap.value}
                    onChange={handleCrossFade}
                    className="w-full"
                />
                <div className="text-center">
                    <span className="text-sm">크로스페이더: {(crossfadeSnap.value * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    )
}

export default CrossFader
