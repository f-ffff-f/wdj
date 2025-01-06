import { audioManager } from '@/app/_lib/AudioManager/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import React from 'react'
import { useSnapshot } from 'valtio'

const List = () => {
    const snapshot = useSnapshot(store)

    return (
        <div className="w-full max-w-2xl mx-auto">
            {snapshot.vault.library.map((track) => (
                <Item key={track.id} id={track.id} fileName={track.fileName} url={track.url} />
            ))}
        </div>
    )
}

interface ITrackListItemProps {
    id: string
    fileName: string
    url: string
}

const Item: React.FC<ITrackListItemProps> = ({ id, fileName, url }) => {
    const handleLoadToDeck = (deckId: number) => {
        audioManager.loadTrack(deckId, url)
    }

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <button
                onClick={() => handleLoadToDeck(1)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                1
            </button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <button
                onClick={() => handleLoadToDeck(2)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                2
            </button>
        </div>
    )
}

export default List
