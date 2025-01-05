import { store } from '@/app/_lib/store'
import React, { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'

interface WebAudioWrapperProps {
    audioContext: AudioContext
    children: React.ReactNode
}

const WebAudioWrapper = ({ audioContext, children }: WebAudioWrapperProps) => {
    // store의 상태 변화 감지
    const deckASnapshot = useSnapshot(store.controller.decks.a)
    const deckBSnapshot = useSnapshot(store.controller.decks.b)
    const crossfadeSnapshot = useSnapshot(store.controller.crossfade)

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

    // 트랙 게인 제어
    useEffect(() => {
        if (!gainA.current) return
        gainA.current.gain.value = deckASnapshot.volume
    }, [deckASnapshot.volume])

    useEffect(() => {
        if (!gainB.current) return
        gainB.current.gain.value = deckBSnapshot.volume
    }, [deckBSnapshot.volume])

    // 글로벌 크로스페이더 제어
    useEffect(() => {
        if (!crossFadeA.current || !crossFadeB.current) return
        const value = crossfadeSnapshot.value
        crossFadeA.current.gain.value = Math.cos((value * Math.PI) / 2)
        crossFadeB.current.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
    }, [crossfadeSnapshot.value])

    return (
        <>
            <audio ref={audioA} />
            <audio ref={audioB} />
            {children}
        </>
    )
}

export default WebAudioWrapper
