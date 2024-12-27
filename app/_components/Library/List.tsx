// 라이브러리 리스트 컴포넌트

import React from 'react'
import { useSnapshot } from 'valtio'
import { store } from '@/app/_lib/store'

const LibraryList = () => {
    const { library } = useSnapshot(store.vault)

    const handleLoadToDeck = (trackId: string) => (deckId: 'a' | 'b') => {
        const track = library.find((t) => t.id === trackId)
        if (!track) return

        // store 상태만 업데이트. useToneNodes에서 이 변경을 감지하여 처리
        store.decks[deckId].currentTrack = {
            ...track,
            duration: 0, // 실제 duration은 로드 완료 후 useToneNodes에서 업데이트
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {library.map((track) => (
                <TrackListItem
                    key={track.id}
                    id={track.id}
                    fileName={track.fileName}
                    onLoadToDeck={handleLoadToDeck(track.id)}
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

const TrackListItem: React.FC<ITrackListItemProps> = ({ id, fileName, onLoadToDeck }) => (
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

export default LibraryList
