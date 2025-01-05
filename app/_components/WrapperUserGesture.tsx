import React, { useState } from 'react'

const WrapperUserGesture = ({ children }: { children: React.ReactNode }) => {
    const [isGestured, setIsGestured] = useState(false)

    return <>{!isGestured ? <button onClick={() => setIsGestured(true)}>Click to Start</button> : children}</>
}

export default WrapperUserGesture
