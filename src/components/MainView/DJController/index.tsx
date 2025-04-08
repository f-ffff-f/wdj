'use client'

import WaveformVisualizer from '@/components/MainView/DJController/WaveformVisualizer'
import FileUploader from '@/components/MainView/TrackLibrary/FileUploader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SliderCrossfade } from '@/components/ui/sliderCrossfade'
import { SliderSpeed } from '@/components/ui/sliderSpeed'
import { SliderVolume } from '@/components/ui/sliderVolume'
import { DECK_IDS, TDeckId } from '@/lib/client/deck'
import { cn, formatTimeUI } from '@/lib/client/utils'
import { deckoSingleton } from '@ghr95223/decko'
import { useEffect, useState, useTransition } from 'react'
interface IDeckUI {
    id: TDeckId
    volume: number
    speed: number
    playbackTime: number
    audioBufferDuration: number
    isPlaying: boolean
    isSeeking: boolean
}

interface IDJContollerUI {
    deckList: IDeckUI[]
    crossFade: number
}

const getInitialUI = () => ({
    deckList: [
        {
            id: DECK_IDS.ID_1,
            volume: deckoSingleton.getDeck(DECK_IDS.ID_1)?.gainNode.gain.value ?? 0,
            speed: deckoSingleton.getDeck(DECK_IDS.ID_1)?.speed ?? 1,
            playbackTime: deckoSingleton.getPlaybackTime(DECK_IDS.ID_1) ?? 0,
            audioBufferDuration: deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_1) ?? 0,
            isPlaying: deckoSingleton.getDeck(DECK_IDS.ID_1)?.isPlaying ?? false,
            isSeeking: deckoSingleton.getDeck(DECK_IDS.ID_1)?.isSeeking ?? false,
        },
        {
            id: DECK_IDS.ID_2,
            volume: deckoSingleton.getDeck(DECK_IDS.ID_2)?.gainNode.gain.value ?? 0,
            speed: deckoSingleton.getDeck(DECK_IDS.ID_2)?.speed ?? 1,
            playbackTime: deckoSingleton.getPlaybackTime(DECK_IDS.ID_2) ?? 0,
            audioBufferDuration: deckoSingleton.getAudioBufferDuration(DECK_IDS.ID_2) ?? 0,
            isPlaying: deckoSingleton.getDeck(DECK_IDS.ID_2)?.isPlaying ?? false,
            isSeeking: deckoSingleton.getDeck(DECK_IDS.ID_2)?.isSeeking ?? false,
        },
    ],
    crossFade: deckoSingleton.getCrossFade(),
})

const transitionCallback = (prev: IDJContollerUI) => ({
    ...prev,
    deckList: prev.deckList.map((deck) => {
        const playbackTime = deckoSingleton.getPlaybackTime(deck.id)
        const audioBufferDuration = deckoSingleton.getAudioBufferDuration(deck.id)
        const volume = deckoSingleton.getVolume(deck.id)
        const speed = deckoSingleton.getSpeed(deck.id)
        const isPlaying = deckoSingleton.isPlaying(deck.id)
        const isSeeking = deckoSingleton.isSeeking(deck.id)
        return {
            ...deck,
            playbackTime,
            audioBufferDuration,
            volume,
            speed,
            isPlaying,
            isSeeking,
        }
    }),
    crossFade: deckoSingleton.getCrossFade(),
})
export const DJController = ({ children: TrackListComponent }: { children: React.ReactNode }) => {
    const [stateUI, setStateUI] = useState(getInitialUI())
    const [, startTransition] = useTransition()
    // Throttle UI updates to roughly 30fps to ease page transitions
    useEffect(() => {
        let rafId: number
        let lastUpdate = performance.now()
        const throttleInterval = 33 // roughly 30fps
        const updateDecks = () => {
            const now = performance.now()
            if (now - lastUpdate >= throttleInterval) {
                lastUpdate = now
                startTransition(() => {
                    setStateUI(transitionCallback)
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
                {stateUI.deckList.map((deckUI) => (
                    <div key={deckUI.id} className="flex flex-col gap-4 flex-1">
                        <div
                            className={cn(
                                'max-md:flex-wrap',
                                'flex items-baseline gap-1',
                                deckUI.id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <SliderVolume
                                    id={`gain-${deckUI.id}`}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={[deckUI.volume]}
                                    onValueChange={(numbers) => deckoSingleton.setVolume(deckUI.id, numbers[0])}
                                />
                                <Label>Volume</Label>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <SliderSpeed
                                    id={`speed-${deckUI.id}`}
                                    min={0.5}
                                    max={1.5}
                                    step={0.01}
                                    value={[deckUI.speed]}
                                    onValueChange={(numbers) => deckoSingleton.setSpeed(deckUI.id, numbers[0])}
                                />
                                <Label>Speed</Label>
                            </div>
                            <WaveformVisualizer deckId={deckUI.id} />
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-4',
                                deckUI.id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <Button
                                onClick={() => deckoSingleton.playPauseDeck(deckUI.id)}
                                id={`play-pause-${deckUI.id}`}
                                className="min-w-[80px] text-center"
                            >
                                {deckUI.isPlaying ? 'pause' : 'play'}
                            </Button>
                            <Label className="min-w-[10ch] inline-block text-center text-xs">
                                {formatTimeUI(deckUI.playbackTime)} / -
                                {Number.isFinite(deckUI.audioBufferDuration)
                                    ? formatTimeUI(deckUI.playbackTime - deckUI.audioBufferDuration)
                                    : '∞'}
                            </Label>
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-1/2 self-center flex flex-col gap-2">
                <SliderCrossfade
                    id="crossfader"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[stateUI.crossFade]}
                    onValueChange={(numbers) => deckoSingleton.setCrossFade(numbers[0])}
                />
                <Label className="self-center">Crossfader</Label>
            </div>
            <div className="flex flex-col items-center self-center gap-4 ">
                <div>
                    <Label className="self-start" htmlFor="file-uploader">
                        add audio file
                    </Label>
                    <FileUploader />
                </div>
                {TrackListComponent}
            </div>
        </div>
    )
}

export default DJController
