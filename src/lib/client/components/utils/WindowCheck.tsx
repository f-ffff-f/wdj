'use client'

import { useState, useEffect, ReactNode } from 'react'

interface WindowCheckProps {
    children: ReactNode
    fallback?: ReactNode
}

const WindowCheck = ({ children, fallback }: WindowCheckProps) => {
    const [hasWindow, setHasWindow] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setHasWindow(true)
        }
    }, [])

    if (!hasWindow) {
        return fallback || null
    }

    return <>{children}</>
}

export default WindowCheck
