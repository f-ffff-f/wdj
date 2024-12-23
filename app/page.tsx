'use client'

import ControlInterface from '@/app/_components/ControlInterface'
import React, { useState } from 'react'

const Home: React.FC = () => {
    const [isGestured, setIsGestured] = useState(false)
    return <>{isGestured ? <ControlInterface /> : <button onClick={() => setIsGestured(true)}>gesture</button>}</>
}

export default Home
