// DjMultiDeckPlayer.tsx
import React, { useEffect, useState } from 'react'
import FileUploader from '@/app/_components/Vault/FileUploader'
import List from '@/app/_components/Vault/List'
import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { formatTimeUI } from '@/app/_lib/utils'
import WaveformVisualizer from '@/app/_components/WaveformVisualizer'
import { SliderCrossfade } from '@/components/ui/sliderCrossfade'
import { SliderVolume } from '@/components/ui/sliderVolume'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface IDeckUI {
    id: number
    volume: number
    playbackTime: number
    audioBufferDuration: number
    isPlaying: boolean
    isSeeking: boolean
}

interface IDJContollerUI {
    deckList: IDeckUI[]
    crossFade: number
}

const deckA = audioManager.addDeck()
const deckB = audioManager.addDeck()

const INITIAL_UI: IDJContollerUI = {
    deckList: [
        {
            id: deckA.id,
            volume: deckA.gainNode.gain.value,
            playbackTime: 0,
            audioBufferDuration: 0,
            isPlaying: false,
            isSeeking: false,
        },
        {
            id: deckB.id,
            volume: deckB.gainNode.gain.value,
            playbackTime: 0,
            audioBufferDuration: 0,
            isPlaying: false,
            isSeeking: false,
        },
    ],
    crossFade: audioManager.getCrossFade(),
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
                    const playbackTime = audioManager.getPlaybackTime(deck.id)
                    const audioBufferDuration = audioManager.getAudioBufferDuration(deck.id)
                    const volume = audioManager.getVolume(deck.id)
                    const isPlaying = audioManager.isPlaying(deck.id)
                    const isSeeking = audioManager.isSeeking(deck.id)
                    return {
                        ...deck,
                        playbackTime,
                        audioBufferDuration,
                        volume,
                        isPlaying,
                        isSeeking,
                    }
                }),
                crossFade: audioManager.getCrossFade(),
            }))
            rafId = requestAnimationFrame(updateDecks)
        }
        updateDecks()
        return () => cancelAnimationFrame(rafId)
    }, [])

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-4">
                {stateUI.deckList.map((deckUI) => (
                    <div key={deckUI.id} className="flex flex-col gap-4">
                        <div
                            className={cn(
                                'flex items-baseline',
                                deckUI.id === deckA.id ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <div>
                                <SliderVolume
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={[deckUI.volume]}
                                    onValueChange={(numbers) => audioManager.setVolume(deckUI.id, numbers[0])}
                                />
                            </div>
                            <div>
                                <WaveformVisualizer deckId={deckUI.id} />
                            </div>
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-4',
                                deckUI.id === deckA.id ? 'flex-row-reverse' : 'flex-row',
                            )}
                        >
                            <Button onClick={() => audioManager.playPauseDeck(deckUI.id)}>
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
            <div className="w-1/2 self-center">
                <SliderCrossfade
                    min={0}
                    max={1}
                    step={0.01}
                    value={[stateUI.crossFade]}
                    onValueChange={(numbers) => audioManager.setCrossFade(numbers[0])}
                />
                <Label className="self-start">Crossfader</Label>
            </div>
            <div className="flex flex-col items-center w-1/2 self-center gap-4">
                <div>
                    <Label className="self-start" htmlFor="file-uploader">
                        add audio file to library
                    </Label>
                    <FileUploader />
                </div>
                <List />
            </div>
        </div>
    )
}

export default DJController
