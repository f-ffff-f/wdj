// DjMultiDeckPlayer.tsx
import React, { useEffect, useState } from 'react'
import { AudioManager } from '@/app/_lib/AudioManager/AudioManager'
import { ITrack } from '@/app/_lib/types'

interface IDeckUI {
    id: number
    volume: number
    currentTime: number
    duration: number
    isPlaying: boolean
    // currentTrack: ITrack | null
}

interface IDJContollerUI {
    deckList: IDeckUI[]
    crossFade: number
}

const audioManager = new AudioManager()

const deckA = audioManager.addDeck()
const deckB = audioManager.addDeck()

const INITIAL_UI: IDJContollerUI = {
    deckList: [
        {
            id: deckA.id,
            volume: deckA.gainNode.gain.value,
            currentTime: deckA.audioElement.currentTime,
            duration: deckA.audioElement.duration,
            isPlaying: false,
            // currentTrack: null,
        },
        {
            id: deckB.id,
            volume: deckB.gainNode.gain.value,
            currentTime: deckB.audioElement.currentTime,
            duration: deckB.audioElement.duration,
            isPlaying: false,
            // currentTrack: null,
        },
    ],
    crossFade: audioManager.getCrossFade(),
}

export const DJController = () => {
    const [stateUI, setStateUI] = useState(INITIAL_UI)

    // 매 프레임 인스턴스를 조회해서 상태 갱신
    useEffect(() => {
        let rafId: number
        const updateDecks = () => {
            setStateUI((prev) => ({
                ...prev,
                deckList: prev.deckList.map((deck) => {
                    const currentTime = audioManager.getCurrentTime(deck.id)
                    const duration = audioManager.getDuration(deck.id)
                    const volume = audioManager.getVolume(deck.id)
                    const isPlaying = audioManager.isPlaying(deck.id)
                    return { ...deck, currentTime, duration, volume, isPlaying }
                }),
                crossFade: audioManager.getCrossFade(),
            }))
            rafId = requestAnimationFrame(updateDecks)
        }
        updateDecks()
        return () => cancelAnimationFrame(rafId)
    }, [])

    // 파일 로드
    const handleFileChange = (deckId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        audioManager.loadTrack(deckId, URL.createObjectURL(file))
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
        <div>
            <div style={{ display: 'flex', gap: '2rem' }}>
                {stateUI.deckList.map((deck) => (
                    <div key={deck.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                        <h2>{`id: ${deck.id}`}</h2>

                        <div>
                            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(deck.id, e)} />
                        </div>

                        <div>
                            <button onClick={() => handlePlayPauseToggle(deck.isPlaying, deck.id)}>
                                {deck.isPlaying ? 'pause' : 'play'}
                            </button>
                        </div>

                        <div>
                            Volume:{' '}
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={deck.volume}
                                onChange={(e) => handleVolumeChange(deck.id, e)}
                            />
                            <span> {deck.volume.toFixed(2)}</span>
                        </div>

                        <div>
                            Time: {deck.currentTime.toFixed(2)} /{' '}
                            {Number.isFinite(deck.duration) ? deck.duration.toFixed(2) : '∞'}
                        </div>
                    </div>
                ))}
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
            </div>
        </div>
    )
}

export default DJController
