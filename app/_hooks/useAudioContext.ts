import { useState, useEffect } from 'react'

/**
 * 오디오 컨텍스트를 관리하는 커스텀 훅
 * @returns 오디오 컨텍스트와 초기화 함수
 */
export const useAudioContext = () => {
    const [audioContext, setAudioContext] = useState<AudioContext>()

    const initializeContext = async () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        setAudioContext(ctx)
    }

    useEffect(() => {
        return () => {
            audioContext?.close()
        }
    }, [audioContext])

    return {
        audioContext,
        initializeContext,
    }
}
