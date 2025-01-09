import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import { Button } from '@/components/ui/button'
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
            <Button onClick={() => handleLoadToDeck(1)}>load to deck 1</Button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <Button onClick={() => handleLoadToDeck(2)}>load to deck 2</Button>
        </div>
    )
}

export default List
