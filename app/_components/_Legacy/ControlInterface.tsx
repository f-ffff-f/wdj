import CrossFader from '@/app/_components/_Legacy/CrossFader'
import Deck from '@/app/_components/_Legacy/Deck'
import LibraryList from '@/app/_components/_Legacy/Library/List'
import LibraryUploader from '@/app/_components/_Legacy/Library/Uploader'
import { DECK_IDS } from '@/app/_lib/constants'
import React, { useEffect, useRef, useState } from 'react'

const ControlInterface = () => {
    const [audioContext, setAudioContext] = useState<AudioContext>()

    useEffect(() => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        setAudioContext(ctx)

        return () => {
            ctx.close()
        }
    }, [])

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

    const audioRef = { a: audioA, b: audioB }
    const gainRef = { a: gainA, b: gainB }
    const crossFadeRef = { a: crossFadeA, b: crossFadeB }

    if (!audioContext) return null
    return (
        <>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {DECK_IDS.map((id) => {
                    return (
                        <div key={`${id}_div`}>
                            <audio key={`${id}_audio`} ref={audioRef[id]}></audio>
                            <Deck
                                key={id}
                                id={id}
                                audioRef={audioRef[id]}
                                gainRef={gainRef[id]}
                                audioContext={audioContext}
                            />
                        </div>
                    )
                })}
            </div>
            <CrossFader crossFade={crossFadeRef} audioContext={audioContext} />
            <div className="mt-8">
                <LibraryUploader />
                <LibraryList audioRef={{ a: audioA, b: audioB }} audioContext={audioContext} />
            </div>
        </>
    )
}

export default ControlInterface
