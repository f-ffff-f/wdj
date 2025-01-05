import { createContext, useContext, useEffect, useRef } from 'react'
import { AudioContextContext } from './AudioContextProvider'
import { TDeckIds } from '@/app/_lib/types'

type AudioNode = {
    audio: React.RefObject<HTMLAudioElement>
    source: React.RefObject<MediaElementAudioSourceNode | null>
    gain: React.RefObject<GainNode | null>
    crossFade: React.RefObject<GainNode | null>
}

type IAudioNodes = Record<TDeckIds[number], AudioNode>

export const AudioNodeContext = createContext<IAudioNodes | null>(null)

interface AudioNodeProviderProps {
    children: React.ReactNode
}

export const AudioNodeProvider = ({ children }: AudioNodeProviderProps) => {
    const audioContext = useContext(AudioContextContext)

    // HTML Audio Elements
    const audioA = useRef<HTMLAudioElement>(null)
    const audioB = useRef<HTMLAudioElement>(null)

    // Audio Source Nodes
    const sourceA = useRef<MediaElementAudioSourceNode | null>(null)
    const sourceB = useRef<MediaElementAudioSourceNode | null>(null)

    // Gain Nodes
    const gainA = useRef<GainNode | null>(null)
    const gainB = useRef<GainNode | null>(null)

    // CrossFade Nodes
    const crossFadeA = useRef<GainNode | null>(null)
    const crossFadeB = useRef<GainNode | null>(null)

    // 노드 초기화 및 연결
    useEffect(() => {
        if (!audioA.current || !audioB.current || !audioContext) return
        if (sourceA.current || sourceB.current) return

        try {
            // Source 노드 생성 및 연결
            sourceA.current = audioContext.createMediaElementSource(audioA.current)
            console.log(audioA.current, 'audioA.current', sourceA.current, 'sourceA.current')
            sourceB.current = audioContext.createMediaElementSource(audioB.current)

            // Gain 노드 초기화
            gainA.current = audioContext.createGain()
            gainB.current = audioContext.createGain()

            // 크로스페이더 노드 초기화
            crossFadeA.current = audioContext.createGain()
            crossFadeB.current = audioContext.createGain()

            // 노드 연결
            sourceA.current.connect(gainA.current).connect(crossFadeA.current).connect(audioContext.destination)
            sourceB.current.connect(gainB.current).connect(crossFadeB.current).connect(audioContext.destination)
        } catch (error) {
            console.error('오디오 노드 초기화 에러:', error)
        }

        return () => {
            sourceA.current?.disconnect()
            sourceB.current?.disconnect()
            gainA.current?.disconnect()
            gainB.current?.disconnect()
            crossFadeA.current?.disconnect()
            crossFadeB.current?.disconnect()
        }
    }, [audioContext])

    return (
        <AudioNodeContext.Provider
            value={{
                a: { audio: audioA, source: sourceA, gain: gainA, crossFade: crossFadeA },
                b: { audio: audioB, source: sourceB, gain: gainB, crossFade: crossFadeB },
            }}
        >
            {children}
        </AudioNodeContext.Provider>
    )
}

// 커스텀 훅
export const useAudioNodes = () => {
    const context = useContext(AudioNodeContext)
    if (!context) {
        throw new Error('useAudioNodes must be used within an AudioNodeProvider')
    }
    return context
}
