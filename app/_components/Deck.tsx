import React, { useRef, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { consoleState } from '@/app/_lib/consoleState'
import FileUploader from '@/app/_components/FileUploader'

interface DeckProps {
    deckNumber: 1 | 2
}

const Deck: React.FC<DeckProps> = ({ deckNumber }) => {
    const deckState = deckNumber === 1 ? consoleState.deck1 : consoleState.deck2
    const crossfadeValue = consoleState.crossfadeValue
    const deckSnap = useSnapshot(deckState)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)

    const handleFileSelect = (file: File) => {
        deckState.currentTrack = {
            id: file.name,
            title: file.name,
            artist: 'Unknown',
            duration: 0,
        }
        deckState.playPosition = 0
        deckState.isPlaying = false

        const audioURL = URL.createObjectURL(file)
        if (audioRef.current) {
            audioRef.current.src = audioURL
        }
    }

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (deckSnap.isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
        }
        deckState.isPlaying = !deckState.isPlaying
    }

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        deckState.volume = parseFloat(event.target.value)
        if (gainNodeRef.current) {
            const crossfadeAdjustment =
                deckNumber === 1
                    ? 1 - crossfadeValue // Deck 1은 크로스페이더 값이 낮을수록 볼륨이 높아짐
                    : crossfadeValue // Deck 2는 크로스페이더 값이 높을수록 볼륨이 높아짐
            gainNodeRef.current.gain.value = deckSnap.volume * crossfadeAdjustment
        }
    }

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext()
        }
        if (audioRef.current && audioContextRef.current) {
            const audioContext = audioContextRef.current

            // Create MediaElementAudioSourceNode if not already created
            if (!sourceNodeRef.current) {
                sourceNodeRef.current = audioContext.createMediaElementSource(audioRef.current)
            }

            // Create GainNode if not already created
            if (!gainNodeRef.current) {
                gainNodeRef.current = audioContext.createGain()
                sourceNodeRef.current.connect(gainNodeRef.current)
                gainNodeRef.current.connect(audioContext.destination)
            }

            // Update gain based on volume and crossfade value
            const crossfadeAdjustment = deckNumber === 1 ? 1 - crossfadeValue : crossfadeValue
            gainNodeRef.current.gain.value = deckSnap.volume * crossfadeAdjustment
        }
    }, [deckSnap.volume, crossfadeValue, deckNumber])

    return (
        <div>
            <h2>Deck {deckNumber}</h2>
            <div>
                <p>트랙: {deckSnap.currentTrack ? deckSnap.currentTrack.title : '없음'}</p>
                <p>재생 위치: {deckSnap.playPosition}s</p>
                <p>볼륨: {deckSnap.volume}</p>
                <button onClick={handlePlayPause}>{deckSnap.isPlaying ? '일시정지' : '재생'}</button>
                <input type="range" min="0" max="1" step="0.01" value={deckSnap.volume} onChange={handleVolumeChange} />
                <FileUploader onFileSelect={handleFileSelect} />
                <audio
                    ref={audioRef}
                    onTimeUpdate={() => {
                        if (audioRef.current) {
                            deckState.playPosition = audioRef.current.currentTime
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default Deck
