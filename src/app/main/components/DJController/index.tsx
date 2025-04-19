'use client'

import FileUploader from '@/app/main/components/DJController/Library/FileUploader'
import WaveformVisualizer from '@/app/main/components/DJController/Waveform/WaveformVisualizer'
import { Button } from '@/lib/client/components/ui/button'
import { Label } from '@/lib/client/components/ui/label'
import { SliderCrossfade } from '@/lib/client/components/ui/sliderCrossfade'
import { SliderSpeed } from '@/lib/client/components/ui/sliderSpeed'
import { SliderVolume } from '@/lib/client/components/ui/sliderVolume'
import { DECK_IDS } from '@/lib/client/constants'
import { myDeckoManager } from '@/lib/client/myDeckoManager'
import { state } from '@/lib/client/state'
import { TDeckId } from '@/lib/client/types'
import { cn, formatPlaybackTimeUI } from '@/lib/client/utils'
import React, { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'

// Memoized deck component with individual props instead of a deck object
const DeckControl = React.memo(({ id }: { id: TDeckId }) => {
    const deck = useSnapshot(state.decks[id]!)
    const [playbackTime, setPlaybackTime] = useState(0)
    const deferredPlaybackTime = useDeferredValue(playbackTime)
    const deferredAudioBufferDuration = useDeferredValue(deck.duration)

    const handleVolumeChange = useCallback((numbers: number[]) => myDeckoManager.setVolume(id, numbers[0]), [id])
    const handleSpeedChange = useCallback((numbers: number[]) => myDeckoManager.setSpeed(id, numbers[0]), [id])
    const handlePlayPause = useCallback(() => myDeckoManager.playPauseDeck(id), [id])

    useEffect(() => {
        let rafId: number
        let lastUpdate = performance.now()
        const throttleInterval = 30

        const updateDecks = () => {
            const now = performance.now()
            if (now - lastUpdate >= throttleInterval) {
                lastUpdate = now
                setPlaybackTime(myDeckoManager.getPlaybackTime(id))
            }
            rafId = requestAnimationFrame(updateDecks)
        }

        updateDecks()
        return () => {
            cancelAnimationFrame(rafId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex flex-col gap-4 flex-1">
            <div
                className={cn(
                    'max-md:flex-wrap',
                    'flex items-baseline gap-1',
                    id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                )}
            >
                <Volume value={deck.volume} id={id} onChange={handleVolumeChange} />
                <Speed value={deck.speed} id={id} onChange={handleSpeedChange} />
                <WaveformVisualizer deckId={id} />
            </div>
            <div className={cn('flex items-center gap-4', id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row')}>
                <PlayPause value={deck.isPlaying} id={id} onChange={handlePlayPause} />
                <PlayBackTime playbackTime={deferredPlaybackTime} audioBufferDuration={deferredAudioBufferDuration} />
            </div>
        </div>
    )
})

DeckControl.displayName = 'DeckControl'

const Volume = React.memo(
    ({ value, id, onChange }: { value: number; id: TDeckId; onChange: (numbers: number[]) => void }) => {
        return (
            <div className="flex flex-col items-center gap-2">
                <SliderVolume
                    id={`volume-${id}`}
                    min={0}
                    max={1}
                    step={0.01}
                    value={[value]}
                    onValueChange={onChange}
                />
                <Label>Volume</Label>
            </div>
        )
    },
)

Volume.displayName = 'Volume'

const Speed = React.memo(
    ({ value, id, onChange }: { value: number; id: TDeckId; onChange: (numbers: number[]) => void }) => {
        return (
            <div className="flex flex-col items-center gap-2">
                <SliderSpeed
                    id={`speed-${id}`}
                    min={0.5}
                    max={1.5}
                    step={0.01}
                    value={[value]}
                    onValueChange={onChange}
                />
                <Label>Speed</Label>
            </div>
        )
    },
)

Speed.displayName = 'Speed'

const PlayPause = React.memo(
    ({ value, id, onChange }: { value: boolean; id: TDeckId; onChange: (id: number) => void }) => {
        return (
            <Button onClick={() => onChange(id)} id={`play-pause-${id}`} className="min-w-[80px] text-center">
                {value ? 'pause' : 'play'}
            </Button>
        )
    },
)

PlayPause.displayName = 'PlayPause'

const PlayBackTime = React.memo(
    ({ playbackTime, audioBufferDuration }: { playbackTime: number; audioBufferDuration: number }) => {
        return (
            <Label className="min-w-[10ch] inline-block text-center text-xs">
                {formatPlaybackTimeUI(playbackTime)} / -
                {Number.isFinite(audioBufferDuration) ? formatPlaybackTimeUI(playbackTime - audioBufferDuration) : '∞'}
            </Label>
        )
    },
)

PlayBackTime.displayName = 'PlayBackTime'

const Crossfader = React.memo(() => {
    const crossFade = useSnapshot(state).crossFade
    const onChange = useCallback((numbers: number[]) => myDeckoManager.setCrossFade(numbers[0]), [])
    return (
        <div className="w-1/2 self-center flex flex-col gap-2">
            <SliderCrossfade id="crossfader" min={0} max={1} step={0.01} value={[crossFade]} onValueChange={onChange} />
            <Label className="self-center">Crossfader</Label>
        </div>
    )
})

Crossfader.displayName = 'Crossfader'

const DJController = ({ children: TrackListComponent }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-4">
                {Object.values(DECK_IDS).map((deckId) => (
                    <DeckControl key={deckId} id={deckId} />
                ))}
            </div>
            <Crossfader />

            <div className="flex flex-col items-center self-center gap-4">
                <FileUploader />
                {TrackListComponent}
            </div>
        </div>
    )
}

export default DJController
