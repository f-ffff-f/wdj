import React from 'react'
import Deck from '@/app/_components/Deck'
import Crossfader from '@/app/_components/CrossFader'
import { DECK_IDS } from '@/app/_lib/constants'

const Console = () => {
    return (
        <div>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {DECK_IDS.map((_id) => (
                    <Deck id={_id} key={_id} />
                ))}
            </div>
            <div className="flex justify-center">
                <Crossfader />
            </div>
        </div>
    )
}

export default Console
