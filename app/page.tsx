'use client'

import React from 'react'
import Deck from '@/app/_components/Deck'

const Home: React.FC = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Deck deckNumber={1} />
                <Deck deckNumber={2} />
            </div>
        </div>
    )
}

export default Home
