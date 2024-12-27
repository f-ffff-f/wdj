import React from 'react'
import { useSnapshot } from 'valtio'
import { store } from '@/app/_lib/store'
import LibraryUploader from '@/app/_components/Library/Uploader'
import LibraryList from '@/app/_components/Library/List'
import CrossFader from '@/app/_components/CrossFader'
import { IDeck } from '@/app/_lib/types'
import { useToneNodes } from '@/app/_lib/hooks/useToneNodes'

const ControlInterface = () => {
    const deckAState = store.decks.a
    const deckBState = store.decks.b
    const deckASnapshot = useSnapshot(deckAState)
    const deckBSnapshot = useSnapshot(deckBState)

    useToneNodes()

    const decks = [
        {
            id: 'a',
            title: 'Deck A',
            state: deckAState,
            snapshot: deckASnapshot,
        },
        {
            id: 'b',
            title: 'Deck B',
            state: deckBState,
            snapshot: deckBSnapshot,
        },
    ] as const

    const handleVolumeChange = (deckState: IDeck) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value)
        deckState.volume = newVolume
    }

    const handlePlayPause = (deckState: IDeck) => async () => {
        try {
            deckState.isPlaying = !deckState.isPlaying
        } catch (error) {
            console.error('재생/정지 중 오류 발생:', error)
        }
    }

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {decks.map(({ id, title, state, snapshot }) => (
                    <div key={id} className="p-4 border rounded-lg">
                        <h2 className="text-xl font-bold mb-4">{title}</h2>
                        <div className="space-y-4">
                            <p>트랙: {snapshot.currentTrack ? snapshot.currentTrack.fileName : '없음'}</p>
                            <p>길이: {snapshot.currentTrack?.duration.toFixed(2) || 0}초</p>
                            <p>재생 위치: {snapshot.playPosition.toFixed(2)}초</p>
                            <div className="space-y-2">
                                <p>볼륨: {snapshot.volume.toFixed(2)}</p>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={snapshot.volume}
                                    onChange={handleVolumeChange(state)}
                                    className="w-full"
                                />
                            </div>
                            <button
                                onClick={handlePlayPause(state)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {snapshot.isPlaying ? '정지' : '재생'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <CrossFader />
            <div className="mt-8">
                <LibraryUploader />
                <LibraryList />
            </div>
        </div>
    )
}

export default ControlInterface
