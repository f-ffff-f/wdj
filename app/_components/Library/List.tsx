import { useControl } from '@/app/_hooks/useControl'
import { DECK_IDS } from '@/app/_lib/constants'
import { store } from '@/app/_lib/store'
import { TDeckIds } from '@/app/_lib/types'
import React from 'react'
import { useSnapshot } from 'valtio'

const LibraryList = ({
    audioRef,
    audioContext,
}: {
    audioRef: Record<TDeckIds[number], React.RefObject<HTMLAudioElement>>
    audioContext: AudioContext
}) => {
    const snapshot = useSnapshot(store)
    const { loadToDeck } = useControl(audioContext)

    return (
        <div className="w-full max-w-2xl mx-auto">
            {snapshot.vault.library.map((track) => (
                <TrackListItem
                    key={track.id}
                    id={track.id}
                    fileName={track.fileName}
                    onLoadToDeck={loadToDeck(track, audioRef)}
                />
            ))}
        </div>
    )
}

interface ITrackListItemProps {
    id: string
    fileName: string
    onLoadToDeck: (deckId: TDeckIds[number]) => void
}

const TrackListItem: React.FC<ITrackListItemProps> = ({ id, fileName, onLoadToDeck }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <button
                onClick={() => onLoadToDeck(DECK_IDS[0])}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Deck A
            </button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <button
                onClick={() => onLoadToDeck(DECK_IDS[1])}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Deck B
            </button>
        </div>
    )
}

export default LibraryList
