import Crossfader from '@/app/main/components/DJController/Crossfader'
import Deck from '@/app/main/components/DJController/Deck'
import { DECK_IDS } from '@ghr95223/decko'
import React from 'react'

const DJController = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-4">
                {Object.values(DECK_IDS).map((deckId) => (
                    // DeckControl에는 id만 전달
                    <Deck key={`deck-control-${deckId}`} deckId={deckId} />
                ))}
            </div>
            <Crossfader />
            <div className="flex flex-col items-center self-center gap-4">{children}</div>
            {/* bad practice */}
            {/* <div key="test" className="flex flex-col items-center self-center gap-4">
                <FileUploader />
                {TrackListComponent}
            </div> */}
        </div>
    )
}

export default DJController
