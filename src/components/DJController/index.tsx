import React, { useEffect, useState } from 'react'
import FileUploader from '@/components/TrackLibrary/FileUploader'
import List from '@/components/TrackLibrary/List'
import { deckoSingleton, EDeckIds } from '@ghr95223/decko'
import { formatTimeUI } from '@/lib/client/utils'
import WaveformVisualizer from '@/components/DJController/WaveformVisualizer'
import { SliderCrossfade } from '@/components/ui/sliderCrossfade'
import { SliderSpeed } from '@/components/ui/sliderSpeed'
import { SliderVolume } from '@/components/ui/sliderVolume'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/client/utils'

interface IDeckUI {
    id: EDeckIds
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

const INITIAL_UI: IDJContollerUI = {
    deckList: [
        {
            id: deckoSingleton.getDeck(EDeckIds.DECK_1)?.id ?? EDeckIds.DECK_1,
            volume: deckoSingleton.getDeck(EDeckIds.DECK_1)?.gainNode.gain.value ?? 0,
            speed: deckoSingleton.getDeck(EDeckIds.DECK_1)?.speed ?? 1,
            playbackTime: 0,
            audioBufferDuration: 0,
            isPlaying: deckoSingleton.getDeck(EDeckIds.DECK_1)?.isPlaying ?? false,
            isSeeking: deckoSingleton.getDeck(EDeckIds.DECK_1)?.isSeeking ?? false,
        },
        {
            id: deckoSingleton.getDeck(EDeckIds.DECK_2)?.id ?? EDeckIds.DECK_2,
            volume: deckoSingleton.getDeck(EDeckIds.DECK_2)?.gainNode.gain.value ?? 0,
            speed: deckoSingleton.getDeck(EDeckIds.DECK_2)?.speed ?? 1,
            playbackTime: 0,
            audioBufferDuration: 0,
            isPlaying: deckoSingleton.getDeck(EDeckIds.DECK_2)?.isPlaying ?? false,
            isSeeking: deckoSingleton.getDeck(EDeckIds.DECK_2)?.isSeeking ?? false,
        },
    ],
    crossFade: deckoSingleton.getCrossFade(),
}

export const DJController = () => {
    const [stateUI, setStateUI] = useState(INITIAL_UI)

    // 매 프레임 인스턴스를 조회해서 UI 상태 갱신
    useEffect(() => {
        let rafId: number
        const updateDecks = () => {
            setStateUI((prev) => ({
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
            }))
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
                                deckUI.id === EDeckIds.DECK_1 ? 'flex-row-reverse' : 'flex-row',
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
                                deckUI.id === EDeckIds.DECK_1 ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <Button
                                onClick={() => deckoSingleton.playPauseDeck(deckUI.id)}
                                id={`play-pause-${deckUI.id}`}
                            >
                                {deckUI.isPlaying ? 'pause' : 'play'}
                            </Button>
                            <Label>
                                {formatTimeUI(deckUI.playbackTime)} /{' '}
                                {Number.isFinite(deckUI.audioBufferDuration)
                                    ? formatTimeUI(deckUI.audioBufferDuration)
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
                <List />
            </div>
        </div>
    )
}

export default DJController
