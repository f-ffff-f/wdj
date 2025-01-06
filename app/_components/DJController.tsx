// DjMultiDeckPlayer.tsx
import React, { useEffect, useState } from 'react'
import { MediaElementAudioManager } from '@/app/_lib/AudioManager/MediaElementAudioManager'
import { ITrack } from '@/app/_lib/types'

interface IDeckUI {
    id: number
    volume: number
    currentTime: number
    duration: number
    isPlaying: boolean
    currentTrack: ITrack | null
}

interface IDJContollerUI {
    deckList: IDeckUI[]
    crossFade: number
}

const audioManager = new MediaElementAudioManager()

const deckA = audioManager.addDeck()
const deckB = audioManager.addDeck()

const INITIAL_UI: IDJContollerUI = {
    deckList: [
        {
            id: deckA.id,
            volume: 1,
            currentTime: 0,
            duration: 0,
            isPlaying: false,
            currentTrack: null,
        },
        {
            id: deckB.id,
            volume: 1,
            currentTime: 0,
            duration: 0,
            isPlaying: false,
            currentTrack: null,
        },
    ],
    crossFade: 0.5,
}

export const DJController = () => {
    const [stateUI, setStateUI] = useState(INITIAL_UI)

    // 매 프레임 상태 갱신 (currentTime 등)
    useEffect(() => {
        let rafId: number
        const updateDecks = () => {
            setStateUI((prev) => ({
                ...prev,
                deckList: prev.deckList.map((deck) => {
                    const currentTime = audioManager.getCurrentTime(deck.id)
                    const duration = audioManager.getDuration(deck.id)
                    const isPlaying = audioManager.isPlaying(deck.id)
                    return { ...deck, currentTime, duration, isPlaying }
                }),
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

    const handleVolumeChange = (deckId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = Number(e.target.value)
        audioManager.setVolume(deckId, volume)
        setStateUI((prev) => ({
            ...prev,
            deckList: prev.deckList.map((deck) => (deck.id === deckId ? { ...deck, volume } : deck)),
        }))
    }

    const handleCrossFadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value)
        audioManager.setCrossFade(value)
        setStateUI((prev) => ({
            ...prev,
            crossFade: value,
        }))
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
                            <button onClick={() => audioManager.playDeck(deck.id)} disabled={deck.isPlaying}>
                                Play
                            </button>
                            <button onClick={() => audioManager.pauseDeck(deck.id)} disabled={!deck.isPlaying}>
                                Pause
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
