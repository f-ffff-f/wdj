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
import React, { useCallback, useEffect, useReducer, useTransition } from 'react'

const Volume = React.memo(({ value, deckId }: { value: number; deckId: TDeckId }) => {
    const onChange = useCallback((numbers: number[]) => deckoSingleton.setVolume(deckId, numbers[0]), [deckId])

    return (
        <div className="flex flex-col items-center gap-2">
            <SliderVolume
                id={`volume-${deckId}`}
                min={0}
                max={1}
                step={0.01}
                value={[value]}
                onValueChange={onChange}
            />
            <Label>Volume</Label>
        </div>
    )
})

Volume.displayName = 'Volume'

const Speed = React.memo(({ value, deckId }: { value: number; deckId: TDeckId }) => {
    const onChange = useCallback((numbers: number[]) => deckoSingleton.setSpeed(deckId, numbers[0]), [deckId])

    return (
        <div className="flex flex-col items-center gap-2">
            <SliderSpeed
                id={`speed-${deckId}`}
                min={0.5}
                max={1.5}
                step={0.01}
                value={[value]}
                onValueChange={onChange}
            />
            <Label>Speed</Label>
        </div>
    )
})

Speed.displayName = 'Speed'

const PlayPause = React.memo(({ value, deckId }: { value: boolean; deckId: TDeckId }) => {
    const onChange = useCallback(() => deckoSingleton.playPauseDeck(deckId), [deckId])

    return (
        <Button onClick={onChange} id={`play-pause-${deckId}`} className="min-w-[80px] text-center">
            {value ? 'pause' : 'play'}
        </Button>
    )
})

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

// Define types for our state and actions
type DJState = {
    decks: {
        [key in TDeckId]: {
            volume: number
            speed: number
            playbackTime: number
            audioDuration: number
            isPlaying: boolean
        }
    }
    crossFade: number
}

type DJAction =
    | { type: 'UPDATE_DECK'; deckId: TDeckId; payload: Partial<DJState['decks'][TDeckId]> }
    | { type: 'UPDATE_CROSSFADE'; value: number }

// Reducer function
const djReducer = (state: DJState, action: DJAction): DJState => {
    switch (action.type) {
        case 'UPDATE_DECK':
            return {
                ...state,
                decks: {
                    ...state.decks,
                    [action.deckId]: {
                        ...state.decks[action.deckId],
                        ...action.payload,
                    },
                },
            }
        case 'UPDATE_CROSSFADE':
            return {
                ...state,
                crossFade: action.value,
            }
        default:
            return state
    }
}

const DJController = ({ children: TrackListComponent }: { children: React.ReactNode }) => {
    const initialState: DJState = {
        decks: Object.fromEntries(
            Object.values(DECK_IDS).map((deckId) => [
                deckId,
                {
                    volume: deckoSingleton.getDeck(deckId)?.gainNode.gain.value ?? 0,
                    speed: deckoSingleton.getDeck(deckId)?.speed ?? 1,
                    playbackTime: deckoSingleton.getPlaybackTime(deckId) ?? 0,
                    audioDuration: deckoSingleton.getAudioBufferDuration(deckId) ?? 0,
                    isPlaying: deckoSingleton.getDeck(deckId)?.isPlaying ?? false,
                },
            ]),
        ) as DJState['decks'],
        crossFade: deckoSingleton.getCrossFade(),
    }

    const [state, dispatch] = useReducer(djReducer, initialState)
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
                    Object.values(DECK_IDS).forEach((deckId) => {
                        dispatch({
                            type: 'UPDATE_DECK',
                            deckId,
                            payload: {
                                volume: deckoSingleton.getVolume(deckId),
                                speed: deckoSingleton.getSpeed(deckId),
                                playbackTime: deckoSingleton.getPlaybackTime(deckId),
                                audioDuration: deckoSingleton.getAudioBufferDuration(deckId),
                                isPlaying: deckoSingleton.isPlaying(deckId),
                            },
                        })
                    })

                    dispatch({
                        type: 'UPDATE_CROSSFADE',
                        value: deckoSingleton.getCrossFade(),
                    })
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
                {Object.values(DECK_IDS).map((deckId) => (
                    <div className="flex flex-col gap-4 flex-1" key={`deck-${deckId}`}>
                        <div
                            className={cn(
                                'max-md:flex-wrap',
                                'flex items-baseline gap-1',
                                deckId === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <Volume value={state.decks[deckId].volume} deckId={deckId} />
                            <Speed value={state.decks[deckId].speed} deckId={deckId} />
                            <WaveformVisualizer deckId={deckId} />
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-4',
                                deckId === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <PlayPause value={state.decks[deckId].isPlaying} deckId={deckId} />
                            <PlayBackTime
                                playbackTime={state.decks[deckId].playbackTime}
                                audioBufferDuration={state.decks[deckId].audioDuration}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <Crossfader value={state.crossFade} />
            <div className="flex flex-col items-center self-center gap-4">
                <FileUploader />
                {TrackListComponent}
            </div>
        </div>
    )
}

export default React.memo(DJController)
