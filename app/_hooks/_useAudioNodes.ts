import { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { store } from '@/app/_lib/store'
import { GAIN_NODE_DEFAULT } from '@/app/_lib/constants'

type AudioNodesRefs = {
    playerA: React.RefObject<HTMLAudioElement>
    playerB: React.RefObject<HTMLAudioElement>
    gainA: React.RefObject<GainNode>
    gainB: React.RefObject<GainNode>
    crossFade: React.RefObject<{
        gainA: GainNode
        gainB: GainNode
    }>
}

/**
 * Web Audio API 노드들을 관리하는 커스텀 훅
 * @param audioContext - AudioContext 인스턴스
 * @returns AudioNodes 참조들을 포함하는 객체
 */
export const useAudioNodes = (audioContext: AudioContext | undefined): AudioNodesRefs => {
    // HTML Audio Elements
    const playerA = useRef<HTMLAudioElement>(null)
    const playerB = useRef<HTMLAudioElement>(null)

    // Audio Source Nodes
    const sourceA = useRef<MediaElementAudioSourceNode | null>(null)
    const sourceB = useRef<MediaElementAudioSourceNode | null>(null)

    // Gain Nodes
    const gainA = useRef<GainNode | null>(null)
    const gainB = useRef<GainNode | null>(null)

    // CrossFade Nodes
    const crossFade = useRef<{
        gainA: GainNode
        gainB: GainNode
    } | null>(null)

    // Store Snapshots
    const deckASnapshot = useSnapshot(store.controller.decks.a)
    const deckBSnapshot = useSnapshot(store.controller.decks.b)
    const crossfadeSnapshot = useSnapshot(store.controller.crossfade)

    // 노드 초기화 및 연결
    useEffect(() => {
        if (!audioContext) return

        // CrossFade를 위한 Gain 노드 초기화
        crossFade.current = {
            gainA: audioContext.createGain(),
            gainB: audioContext.createGain(),
        }
        crossFade.current.gainA.gain.value = Math.SQRT1_2
        crossFade.current.gainB.gain.value = Math.SQRT1_2

        // 메인 Gain 노드 초기화
        gainA.current = audioContext.createGain()
        gainB.current = audioContext.createGain()
        gainA.current.gain.value = GAIN_NODE_DEFAULT
        gainB.current.gain.value = GAIN_NODE_DEFAULT

        // Deck A 노드 연결
        if (playerA.current) {
            sourceA.current = audioContext.createMediaElementSource(playerA.current)
            sourceA.current.connect(gainA.current)
            gainA.current.connect(crossFade.current.gainA)
            crossFade.current.gainA.connect(audioContext.destination)
        }

        // Deck B 노드 연결
        if (playerB.current) {
            sourceB.current = audioContext.createMediaElementSource(playerB.current)
            sourceB.current.connect(gainB.current)
            gainB.current.connect(crossFade.current.gainB)
            crossFade.current.gainB.connect(audioContext.destination)
        }

        return () => {
            sourceA.current?.disconnect()
            sourceB.current?.disconnect()
            gainA.current?.disconnect()
            gainB.current?.disconnect()
            crossFade.current?.gainA?.disconnect()
            crossFade.current?.gainB?.disconnect()
        }
    }, [audioContext])

    // 볼륨 제어
    useEffect(() => {
        if (!gainA.current) return
        gainA.current.gain.value = deckASnapshot.volume
    }, [deckASnapshot.volume])

    useEffect(() => {
        if (!gainB.current) return
        gainB.current.gain.value = deckBSnapshot.volume
    }, [deckBSnapshot.volume])

    // 크로스페이더 제어
    useEffect(() => {
        if (!crossFade.current) return

        // 크로스페이더 값을 이용해 게인 계산 (-1 ~ 1 범위)
        const value = crossfadeSnapshot.value
        // 부드러운 크로스페이드를 위해 삼각함수 사용
        crossFade.current.gainA.gain.value = Math.cos(((value + 1) * Math.PI) / 4)
        crossFade.current.gainB.gain.value = Math.cos(((1 - value) * Math.PI) / 4)
    }, [crossfadeSnapshot.value])

    // 재생 위치 업데이트
    useEffect(() => {
        const updatePositions = setInterval(() => {
            if (playerA.current && !playerA.current.paused) {
                store.controller.decks.a.playPosition = playerA.current.currentTime
            }
            if (playerB.current && !playerB.current.paused) {
                store.controller.decks.b.playPosition = playerB.current.currentTime
            }
        }, 100)

        return () => clearInterval(updatePositions)
    }, [])

    // 재생/정지 상태 감지 및 처리
    useEffect(() => {
        if (!playerA.current) return
        console.log('playerA.current', playerA.current)
        if (deckASnapshot.isPlaying) {
            playerA.current.play()
        } else {
            playerA.current.pause()
        }
    }, [deckASnapshot.isPlaying])

    useEffect(() => {
        if (!playerB.current) return
        console.log('playerB.current', playerB.current)
        if (deckBSnapshot.isPlaying) {
            playerB.current.play()
        } else {
            playerB.current.pause()
        }
    }, [deckBSnapshot.isPlaying])

    // Deck A 트랙 로드 감지 및 처리
    useEffect(() => {
        if (!playerA.current) return

        const currentTrack = deckASnapshot.currentTrack
        if (currentTrack?.url) {
            playerA.current.src = currentTrack.url
            playerA.current.load() // 새로운 소스 로드
        }
    }, [deckASnapshot.currentTrack])

    // Deck B 트랙 로드 감지 및 처리
    useEffect(() => {
        if (!playerB.current) return

        const currentTrack = deckBSnapshot.currentTrack
        if (currentTrack?.url) {
            playerB.current.src = currentTrack.url
            playerB.current.load() // 새로운 소스 로드
        }
    }, [deckBSnapshot.currentTrack])

    return {
        playerA,
        playerB,
        gainA,
        gainB,
        crossFade,
    }
}
