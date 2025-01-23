import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { state } from '@/app/_state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'
import { useSnapshot } from 'valtio'
import { Card } from '@/components/ui/card'
import { EDeckIds } from '@/app/_lib/types'

const List = () => {
    const snapshot = useSnapshot(state)
    const focusedId = snapshot.vault.UI.focusedId

    const handleLoadToDeck = (deckId: EDeckIds, url: string) => {
        audioManager.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.vault.UI.focusedId = id
    }

    return (
        <div className="w-full max-w-2xl mx-auto min-h-10" id="vault-list">
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
    handleLoadToDeck: (deckId: EDeckIds, url: string) => void
    handleClick: (id: string) => void
}

const Item: React.FC<ITrackListItemProps> = ({ id, fileName, url, isFocused, handleLoadToDeck, handleClick }) => {
    return (
        <Card className={cn('flex items-center justify-between p-4', isFocused && 'outline outline-2 outline-primary')}>
            <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, url)}>load to deck 1</Button>
            <span className="flex-1 text-center px-4">
                ({id.slice(0, 4)}..) {fileName}
            </span>
            <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, url)}>load to deck 2</Button>
        </Card>
    )
}

export default List
