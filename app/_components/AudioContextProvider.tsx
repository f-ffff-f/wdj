import { createContext, useEffect, useState, type ReactNode } from 'react'

export const AudioContextContext = createContext<AudioContext | undefined>(undefined)

interface AudioContextProviderProps {
    children: ReactNode
}

export const AudioContextProvider = ({ children }: AudioContextProviderProps) => {
    const [audioContext, setAudioContext] = useState<AudioContext>()

    useEffect(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        setAudioContext(ctx)

        return () => {
            ctx.close()
        }
    }, [])

    // audioContext가 초기화될 때까지 로딩 상태를 보여줍니다
    if (!audioContext) {
        return <div>오디오 컨텍스트 초기화중...</div>
    }

    return <AudioContextContext.Provider value={audioContext}>{children}</AudioContextContext.Provider>
}
