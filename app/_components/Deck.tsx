import React, { useRef, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { controlState } from '@/app/_lib/controlState'
import FileUploader from '@/app/_components/FileUploader'
import { TDeckIds } from '@/app/_lib/constants'

interface DeckProps {
    id: TDeckIds[number]
}

const Deck: React.FC<DeckProps> = ({ id }) => {
    const deckState = controlState.decks[id]
    const crossfadeValue = controlState.crossfadeValue
    const deckSnapshot = useSnapshot(deckState)
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
            if (deckSnapshot.isPlaying) {
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
            gainNodeRef.current.gain.value = deckSnapshot.volume
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
        }
    }, [deckSnapshot.volume, crossfadeValue])

    return (
        <div>
            <h2>Deck {id}</h2>
            <div>
                <p>트랙: {deckSnapshot.currentTrack ? deckSnapshot.currentTrack.title : '없음'}</p>
                <p>재생 위치: {deckSnapshot.playPosition}s</p>
                <p>볼륨: {deckSnapshot.volume}</p>
                <button onClick={handlePlayPause}>{deckSnapshot.isPlaying ? '일시정지' : '재생'}</button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={deckSnapshot.volume}
                    onChange={handleVolumeChange}
                />
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
