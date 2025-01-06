import { useControl } from '@/app/_components/_Legacy/_hooks/useControl'
import { store } from '@/app/_lib/store'
import { TDeckIds } from '@/app/_lib/types'
import React from 'react'
import { useSnapshot } from 'valtio'

interface DeckProps {
    id: TDeckIds[number]
    audioRef: React.RefObject<HTMLAudioElement>
    gainRef: React.RefObject<GainNode>
    audioContext: AudioContext
}

const Deck = ({ id, audioRef, gainRef, audioContext }: DeckProps) => {
    const snapshot = useSnapshot(store)
    const { togglePlay, setVolume } = useControl(audioContext)
    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">{id}</h2>
            <div className="space-y-4">
                <p>
                    트랙:{' '}
                    {snapshot.controller.decks[id].currentTrack
                        ? snapshot.controller.decks[id].currentTrack.fileName
                        : '없음'}
                </p>
                <p>길이: {snapshot.controller.decks[id].currentTrack?.duration.toFixed(2) || 0}초</p>
                <p>
                    재생 위치:
                    {snapshot.controller.decks[id].playPosition.toFixed(2)}초
                </p>
                <div className="space-y-2">
                    <p>볼륨: {snapshot.controller.decks[id].volume.toFixed(2)}</p>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={snapshot.controller.decks[id].volume}
                        onChange={(e) => setVolume(id, Number(e.target.value), gainRef)}
                        className="w-full"
                    />
                </div>
                <button
                    onClick={() => togglePlay(id, audioRef)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {snapshot.controller.decks[id].isPlaying ? '정지' : '재생'}
                </button>
            </div>
        </div>
    )
}

export default Deck
