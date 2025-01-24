import { audioManager } from '@/app/_lib/audioManager/audioManagerSingleton'
import { deleteTrackFromLibrary, state } from '@/app/_lib/state'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React from 'react'
import { useSnapshot } from 'valtio'
import { Card } from '@/components/ui/card'
import { EDeckIds } from '@/app/_lib/constants'

const List = () => {
    const snapshot = useSnapshot(state)
    const focusedTrackId = snapshot.vault.focusedTrackId

    const handleLoadToDeck = (deckId: EDeckIds, url: string) => {
        audioManager.loadTrack(deckId, url)
    }
    const handleClick = (id: string) => {
        state.vault.focusedTrackId = id
    }

    return (
        <div className="w-full max-w-2xl mx-auto min-h-10" id="vault-list">
            {snapshot.vault.tracks.map((track) => (
                <Item
                    key={track.id}
                    id={track.id}
                    fileName={track.fileName}
                    url={track.url}
                    isFocused={focusedTrackId === track.id}
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
    url?: string
    isFocused: boolean
    handleLoadToDeck: (deckId: EDeckIds, url: string) => void
    handleClick: (id: string) => void
}

const Item: React.FC<ITrackListItemProps> = ({ id, fileName, url, isFocused, handleLoadToDeck, handleClick }) => {
    if (!url) return null

    return (
        <div className="flex">
            <Card
                className={cn(
                    'flex flex-1 items-center justify-between p-4',
                    isFocused && 'outline outline-2 outline-primary',
                )}
                onClick={() => handleClick(id)}
            >
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_1, url)}>load to deck 1</Button>
                <span className="flex-1 text-center px-4">{fileName}</span>
                <Button onClick={() => handleLoadToDeck(EDeckIds.DECK_2, url)}>load to deck 2</Button>
                <Card>
                    <Button onClick={() => deleteTrackFromLibrary(id)}>삭제</Button>
                </Card>
            </Card>
        </div>
    )
}

export default List
