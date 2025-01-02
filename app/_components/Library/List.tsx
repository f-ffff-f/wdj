import { store } from '@/app/_lib/store'
import { ITrack } from '@/app/_lib/types'
import React from 'react'
import { useSnapshot } from 'valtio'

const LibraryList = () => {
    const snapshot = useSnapshot(store)

    const handleLoadToDeck = (track: ITrack) => (deckId: 'a' | 'b') => {
        // store 상태만 업데이트. useToneNodes에서 이 변경을 감지하여 처리
        store.controller.decks[deckId].currentTrack = {
            ...track,
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {snapshot.vault.library.map((track) => (
                <TrackListItem
                    key={track.id}
                    id={track.id}
                    fileName={track.fileName}
                    onLoadToDeck={handleLoadToDeck(track)}
                />
            ))}
        </div>
    )
}

interface ITrackListItemProps {
    id: string
    fileName: string
    onLoadToDeck: (deckId: 'a' | 'b') => void
}

const TrackListItem: React.FC<ITrackListItemProps> = ({ id, fileName, onLoadToDeck }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <button
                onClick={() => onLoadToDeck('a')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Deck A
            </button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <button
                onClick={() => onLoadToDeck('b')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Deck B
            </button>
        </div>
    )
}

export default LibraryList
