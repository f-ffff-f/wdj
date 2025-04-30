'use client'
import { Label } from '@/lib/client/components/ui/label'
import { SliderCrossfade } from '@/lib/client/components/ui/sliderCrossfade'
import { deckoManager, useDeckoSnapshot } from '@ghr95223/decko'
import React, { useCallback } from 'react'

const Crossfader = React.memo(() => {
    const snap = useDeckoSnapshot()
    const onChange = useCallback((numbers: number[]) => deckoManager.setCrossFade(numbers[0]), [])
    return (
        <div className="w-1/2 self-center flex flex-col gap-2">
            <SliderCrossfade
                id="crossfader"
                min={0}
                max={1}
                step={0.01}
                value={[snap.crossFade]}
                onValueChange={onChange}
            />
            <Label className="self-center">Crossfader</Label>
        </div>
    )
})

Crossfader.displayName = 'Crossfader'

export default Crossfader
