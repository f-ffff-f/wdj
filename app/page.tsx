'use client'

import ControlInterface from '@/app/_components/ControlInterface'
import { useState } from 'react'

const Home = () => {
    const [isInteracted, setIsInteracted] = useState(false)

    return <>{!isInteracted ? <button onClick={() => setIsInteracted(true)}>초기화</button> : <ControlInterface />}</>
}

export default Home
