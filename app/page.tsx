'use client'

import React from 'react'
import Deck from '@/app/_components/Deck'
import Crossfader from '@/app/_components/CrossFader'

const Home: React.FC = () => {
    return (
        <div>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                <Deck deckNumber={1} />
                <Deck deckNumber={2} />
            </div>
            <div className="flex justify-center">
                <Crossfader />
            </div>
        </div>
    )
}

export default Home
