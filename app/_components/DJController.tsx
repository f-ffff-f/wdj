// DjMultiDeckPlayer.tsx
import React, { useEffect, useState } from 'react'
import FileUploader from '@/app/_components/Vault/FileUploader'
import List from '@/app/_components/Vault/List'
import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { formatTimeUI } from '@/app/_lib/utils'

interface IDeckUI {
    id: number
    volume: number
    currentTime: number
    pausedAt: number
    duration: number
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
            currentTime: 0,
            pausedAt: 0,
            duration: 0,
            isPlaying: false,
            isSeeking: false,
        },
        {
            id: deckB.id,
            volume: deckB.gainNode.gain.value,
            currentTime: 0,
            pausedAt: 0,
            duration: 0,
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
                    const currentTime = audioManager.getCurrentTime(deck.id)
                    const duration = audioManager.getDuration(deck.id)
                    const volume = audioManager.getVolume(deck.id)
                    const pausedAt = audioManager.getPausedAt(deck.id)
                    const isPlaying = audioManager.isPlaying(deck.id)
                    const isSeeking = audioManager.isSeeking(deck.id)
                    return { ...deck, currentTime, duration, volume, pausedAt, isPlaying, isSeeking }
                }),
                crossFade: audioManager.getCrossFade(),
            }))
            rafId = requestAnimationFrame(updateDecks)
        }
        updateDecks()
        return () => cancelAnimationFrame(rafId)
    }, [])

    const handleSeekChange = (deckId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = Number(e.target.value)
        audioManager.seekDeck(deckId, newTime)
    }

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
            <div className="flex gap-4">
                {stateUI.deckList.map((deckUI) => (
                    <div key={deckUI.id} className="border border-gray-300 p-4">
                        <h2>{`id: ${deckUI.id}`}</h2>
                        <div>
                            <input
                                type="range"
                                min={0}
                                max={deckUI.duration}
                                step={0.01}
                                value={deckUI.isSeeking ? deckUI.currentTime : deckUI.pausedAt}
                                onChange={(e) => handleSeekChange(deckUI.id, e)}
                            />
                            <div>
                                {formatTimeUI(deckUI.currentTime)} /{' '}
                                {Number.isFinite(deckUI.duration) ? formatTimeUI(deckUI.duration) : '∞'}
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
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2"></div>
                            <div>
                                {formatTimeUI(deckUI.currentTime)} /{' '}
                                {Number.isFinite(deckUI.duration) ? formatTimeUI(deckUI.duration) : '∞'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <input
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
