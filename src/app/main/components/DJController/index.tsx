'use client'

import FileUploader from '@/app/main/components/DJController/Library/FileUploader'
import WaveformVisualizer from '@/app/main/components/DJController/Waveform/WaveformVisualizer'
import { Button } from '@/lib/client/components/ui/button'
import { Label } from '@/lib/client/components/ui/label'
import { SliderCrossfade } from '@/lib/client/components/ui/sliderCrossfade'
import { SliderSpeed } from '@/lib/client/components/ui/sliderSpeed'
import { SliderVolume } from '@/lib/client/components/ui/sliderVolume'
import { DECK_IDS } from '@/lib/client/constants'
import { TDeckId } from '@/lib/client/types'
import { cn, formatPlaybackTimeUI } from '@/lib/client/utils'
import { deckoSingleton } from '@ghr95223/decko'
import React, { useCallback, useEffect, useState, useTransition } from 'react'

// Memoized deck component with individual props instead of a deck object
const DeckControl = React.memo(
    ({
        id,
        volume,
        speed,
        playbackTime,
        audioBufferDuration,
        isPlaying,
    }: {
        id: TDeckId
        volume: number
        speed: number
        playbackTime: number
        audioBufferDuration: number
        isPlaying: boolean
    }) => {
        const handleVolumeChange = useCallback((numbers: number[]) => deckoSingleton.setVolume(id, numbers[0]), [id])
        const handleSpeedChange = useCallback((numbers: number[]) => deckoSingleton.setSpeed(id, numbers[0]), [id])
        const handlePlayPause = useCallback(() => deckoSingleton.playPauseDeck(id), [id])

        return (
            <div className="flex flex-col gap-4 flex-1">
                <div
                    className={cn(
                        'max-md:flex-wrap',
                        'flex items-baseline gap-1',
                        id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                    )}
                >
                    <Volume value={volume} id={id} onChange={handleVolumeChange} />
                    <Speed value={speed} id={id} onChange={handleSpeedChange} />
                    <WaveformVisualizer deckId={id} />
                </div>
                <div className={cn('flex items-center gap-4', id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row')}>
                    <PlayPause value={isPlaying} id={id} onChange={handlePlayPause} />
                    <PlayBackTime playbackTime={playbackTime} audioBufferDuration={audioBufferDuration} />
                </div>
            </div>
        )
    },
)

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

const Crossfader = React.memo(({ value }: { value: number }) => {
    const onChange = useCallback((numbers: number[]) => deckoSingleton.setCrossFade(numbers[0]), [])
    return (
        <div className="w-1/2 self-center flex flex-col gap-2">
            <SliderCrossfade id="crossfader" min={0} max={1} step={0.01} value={[value]} onValueChange={onChange} />
            <Label className="self-center">Crossfader</Label>
        </div>
    )
})

Crossfader.displayName = 'Crossfader'

export const DJController = ({ children: TrackListComponent }: { children: React.ReactNode }) => {
    // Deck 1 state
    const [volume1, setVolume1] = useState(deckoSingleton.getDeck(DECK_IDS.ID_1)?.gainNode.gain.value ?? 0)
    const [speed1, setSpeed1] = useState(deckoSingleton.getDeck(DECK_IDS.ID_1)?.speed ?? 1)
    const [playbackTime1, setPlaybackTime1] = useState(deckoSingleton.getPlaybackTime(DECK_IDS.ID_1) ?? 0)
    const [audioDuration1, setAudioDuration1] = useState(deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_1) ?? 0)
    const [isPlaying1, setIsPlaying1] = useState(deckoSingleton.getDeck(DECK_IDS.ID_1)?.isPlaying ?? false)

    // Deck 2 state
    const [volume2, setVolume2] = useState(deckoSingleton.getDeck(DECK_IDS.ID_2)?.gainNode.gain.value ?? 0)
    const [speed2, setSpeed2] = useState(deckoSingleton.getDeck(DECK_IDS.ID_2)?.speed ?? 1)
    const [playbackTime2, setPlaybackTime2] = useState(deckoSingleton.getPlaybackTime(DECK_IDS.ID_2) ?? 0)
    const [audioDuration2, setAudioDuration2] = useState(deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_2) ?? 0)
    const [isPlaying2, setIsPlaying2] = useState(deckoSingleton.getDeck(DECK_IDS.ID_2)?.isPlaying ?? false)

    // Crossfade state
    const [crossFade, setCrossFade] = useState(deckoSingleton.getCrossFade())

    const [, startTransition] = useTransition()
    // Throttle UI updates to roughly 30fps
    useEffect(() => {
        let rafId: number
        let lastUpdate = performance.now()
        const throttleInterval = 33 // roughly 30fps

        const updateDecks = () => {
            const now = performance.now()
            if (now - lastUpdate >= throttleInterval) {
                lastUpdate = now

                startTransition(() => {
                    // Update deck 1 state
                    setVolume1(deckoSingleton.getVolume(DECK_IDS.ID_1))
                    setSpeed1(deckoSingleton.getSpeed(DECK_IDS.ID_1))
                    setPlaybackTime1(deckoSingleton.getPlaybackTime(DECK_IDS.ID_1))
                    setAudioDuration1(deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_1))
                    setIsPlaying1(deckoSingleton.isPlaying(DECK_IDS.ID_1))

                    // Update deck 2 state
                    setVolume2(deckoSingleton.getVolume(DECK_IDS.ID_2))
                    setSpeed2(deckoSingleton.getSpeed(DECK_IDS.ID_2))
                    setPlaybackTime2(deckoSingleton.getPlaybackTime(DECK_IDS.ID_2))
                    setAudioDuration2(deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_2))
                    setIsPlaying2(deckoSingleton.isPlaying(DECK_IDS.ID_2))

                    // Update crossfade
                    setCrossFade(deckoSingleton.getCrossFade())
                })
            }
            rafId = requestAnimationFrame(updateDecks)
        }

        updateDecks()
        return () => {
            cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-4">
                <DeckControl
                    id={DECK_IDS.ID_1}
                    volume={volume1}
                    speed={speed1}
                    playbackTime={playbackTime1}
                    audioBufferDuration={audioDuration1}
                    isPlaying={isPlaying1}
                />
                <DeckControl
                    id={DECK_IDS.ID_2}
                    volume={volume2}
                    speed={speed2}
                    playbackTime={playbackTime2}
                    audioBufferDuration={audioDuration2}
                    isPlaying={isPlaying2}
                />
            </div>
            <Crossfader value={crossFade} />
            <div className="flex flex-col items-center self-center gap-4">
                <FileUploader />
                {TrackListComponent}
            </div>
        </div>
    )
}

export default React.memo(DJController)
