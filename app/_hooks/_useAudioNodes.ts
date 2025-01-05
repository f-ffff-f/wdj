import { AudioContextContext } from '@/app/_components/AudioContextProvider'
import { useContext, useEffect, useRef } from 'react'

interface AudioNodes {
    sourceA: MediaElementAudioSourceNode | null
    sourceB: MediaElementAudioSourceNode | null
    gainA: GainNode | null
    gainB: GainNode | null
    crossFadeA: GainNode | null
    crossFadeB: GainNode | null
}

export const useAudioNodes = () => {
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

        // 이미 생성된 노드가 있다면 초기화하지 않음
        if (sourceA.current || sourceB.current) return

        try {
            // Source 노드 생성 및 연결
            sourceA.current = audioContext.createMediaElementSource(audioA.current)
            sourceB.current = audioContext.createMediaElementSource(audioB.current)

            // Gain 노드 초기화
            gainA.current = audioContext.createGain()
            gainB.current = audioContext.createGain()

            // 크로스페이더 노드 초기화
            crossFadeA.current = audioContext.createGain()
            crossFadeB.current = audioContext.createGain()

            // 노드 연결
            sourceA.current.connect(gainA.current)
            sourceB.current.connect(gainB.current)
            gainA.current.connect(crossFadeA.current)
            gainB.current.connect(crossFadeB.current)
            crossFadeA.current.connect(audioContext.destination)
            crossFadeB.current.connect(audioContext.destination)
        } catch (error) {
            console.error('오디오 노드 초기화 에러:', error)
        }

        // 클린업 함수
        return () => {
            sourceA.current?.disconnect()
            sourceB.current?.disconnect()
            gainA.current?.disconnect()
            gainB.current?.disconnect()
            crossFadeA.current?.disconnect()
            crossFadeB.current?.disconnect()
        }
    }, [audioContext])

    return { audioA, audioB, sourceA, sourceB, gainA, gainB, crossFadeA, crossFadeB }
}
