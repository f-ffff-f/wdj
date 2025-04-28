'use client'

import MarqueeText from '@/app/main/components/DJController/Library/TrackList/Item/MarqueeText'
import { Button } from '@/lib/client/components/ui/button'
import { Card } from '@/lib/client/components/ui/card'
import { cn } from '@/lib/client/utils'
import { DECK_IDS, TDeckId } from '@ghr95223/decko'
import { ArrowUpCircle } from 'lucide-react'
import React from 'react'

export interface ITrackListItemProps {
    trackId: string
    fileName: string
    isFocused: boolean
    handleLoadToDeck: (deckId: TDeckId, url: string) => void
    handleClick: (id: string) => void
    children: React.ReactNode
}

const Item: React.FC<ITrackListItemProps> = ({
    trackId,
    fileName,
    isFocused,
    handleLoadToDeck,
    handleClick,
    children,
}) => {
    return (
        <div className="flex" data-testid={`track-item-${trackId}`} data-trackid={trackId}>
            <Card
                className={cn(
                    'w-full relative flex items-center justify-between p-4 pr-6 shadow-none',
                    isFocused && 'shadow-[inset_0_0_12px_1px] shadow-primary',
                )}
                onClick={() => handleClick(trackId)}
            >
                <Button onClick={() => handleLoadToDeck(DECK_IDS.ID_1, trackId)}>
                    <ArrowUpCircle />
                </Button>
                <MarqueeText text={fileName} />
                <Button onClick={() => handleLoadToDeck(DECK_IDS.ID_2, trackId)}>
                    <ArrowUpCircle />
                </Button>
                {children}
            </Card>
        </div>
    )
}

export default Item
