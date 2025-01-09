// DjMultiDeckPlayer.tsx
import React, { useEffect, useState } from 'react'
import FileUploader from '@/app/_components/Vault/FileUploader'
import List from '@/app/_components/Vault/List'
import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { formatTimeUI } from '@/app/_lib/utils'
import WaveformVisualizer from '@/app/_components/WaveformVisualizer'

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

    const handlePlayPauseToggle = (isPlaying: boolean, deckId: number) => {
        if (isPlaying) {
            audioManager.pauseDeck(deckId)
        } else {
            audioManager.playDeck(deckId)
        }
    }

    const handleVolumeChange = (deckId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = Number(e.target.value)
        audioManager.setVolume(deckId, volume)
    }

    const handleCrossFadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value)
        audioManager.setCrossFade(value)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex">
                {stateUI.deckList.map((deckUI) => (
                    <div key={deckUI.id} className="border border-gray-300 p-4">
                        <h2>{`id: ${deckUI.id}`}</h2>
                        <div>
                            <WaveformVisualizer deckId={deckUI.id} />
                            <div>
                                {formatTimeUI(deckUI.playbackTime)} /{' '}
                                {Number.isFinite(deckUI.audioBufferDuration)
                                    ? formatTimeUI(deckUI.audioBufferDuration)
                                    : '∞'}
                            </div>
                        </div>
                        <div>
                            <button onClick={() => handlePlayPauseToggle(deckUI.isPlaying, deckUI.id)}>
                                {deckUI.isPlaying ? 'pause' : 'play'}
                            </button>
                        </div>
                        <div>
                            Volume:{' '}
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={deckUI.volume}
                                onChange={(e) => handleVolumeChange(deckUI.id, e)}
                            />
                            <span> {deckUI.volume.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center">
                <input
                    className="w-1/3"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={stateUI.crossFade}
                    onChange={(e) => handleCrossFadeChange(e)}
                />
            </div>
            <div>
                <FileUploader />
                <List />
            </div>
        </div>
    )
}

export default DJController
