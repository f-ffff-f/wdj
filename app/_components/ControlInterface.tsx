import { AudioContextContext, AudioContextProvider } from '@/app/_components/AudioContextProvider'
import CrossFader from '@/app/_components/CrossFader'
import Deck from '@/app/_components/Deck'
import LibraryList from '@/app/_components/Library/List'
import LibraryUploader from '@/app/_components/Library/Uploader'
import { DECK_IDS } from '@/app/_lib/constants'
import React, { useContext, useEffect, useRef } from 'react'

const ControlInterface = () => {
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
        <AudioContextProvider>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {DECK_IDS.map((id) => {
                    const audioRef = id === 'a' ? audioA : audioB
                    const gainRef = id === 'a' ? gainA : gainB
                    return (
                        <div key={`${id}_div`}>
                            <audio key={`${id}_audio`} ref={audioRef}></audio>
                            <Deck key={id} id={id} audioRef={audioRef} gainRef={gainRef} />
                        </div>
                    )
                })}
            </div>
            <CrossFader />
            <div className="mt-8">
                <LibraryUploader />
                <LibraryList audioRef={{ a: audioA, b: audioB }} />
            </div>
        </AudioContextProvider>
    )
}

export default ControlInterface
