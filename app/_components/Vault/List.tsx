import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'
import { useSnapshot } from 'valtio'
import { Card } from '@/components/ui/card'
import { EDeckIds, TDeckId } from '@/app/_lib/types'

const List = () => {
    const snapshot = useSnapshot(store)
    const focusedId = snapshot.vault.UI.focusedId

    const handleLoadToDeck = (deckId: TDeckId, url: string) => {
        audioManager.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        store.vault.UI.focusedId = id
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {snapshot.vault.library.map((track) => (
                <Item
                    key={track.id}
                    id={track.id}
                    fileName={track.fileName}
                    url={track.url}
                    isFocused={focusedId === track.id}
                    handleLoadToDeck={handleLoadToDeck}
                    handleClick={handleClick}
                />
            ))}
        </div>
    )
}

interface ITrackListItemProps {
    id: string
    fileName: string
    url: string
    isFocused: boolean
    handleLoadToDeck: (deckId: TDeckId, url: string) => void
    handleClick: (id: string) => void
}

const Item: React.FC<ITrackListItemProps> = ({ id, fileName, url, isFocused, handleLoadToDeck, handleClick }) => {
    return (
        <Card
            className={cn('flex items-center justify-between p-4', isFocused && 'bg-accent/50')}
            onClick={() => handleClick(id)}
        >
            <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, url)}>load to deck 1</Button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, url)}>load to deck 2</Button>
        </Card>
    )
}

export default List
