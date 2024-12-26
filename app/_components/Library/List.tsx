// 라이브러리 리스트 컴포넌트

import React from 'react'
import { useSnapshot } from 'valtio'
import * as Tone from 'tone'
import { store } from '@/app/_lib/store'

interface ILibraryListProps {
    playerA: React.RefObject<Tone.Player>
    playerB: React.RefObject<Tone.Player>
}

const LibraryList = ({ playerA, playerB }: ILibraryListProps) => {
    const { library } = useSnapshot(store.vault)

    const handleLoadToDeck = (trackId: string) => async (deckId: 'a' | 'b') => {
        const track = library.find((t) => t.id === trackId)
        if (!track) return

        const player = deckId === 'a' ? playerA : playerB
        if (!player.current) return

        try {
            await player.current.load(track.url)
            store.decks[deckId].currentTrack = {
                ...track,
                duration: player.current.buffer.duration,
            }
            store.decks[deckId].playPosition = 0
            store.decks[deckId].isPlaying = false
        } catch (error) {
            console.error('오디오 파일 로드 실패:', error)
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
