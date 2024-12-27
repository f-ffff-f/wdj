import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useSnapshot } from 'valtio'
import { store } from '@/app/_lib/store'
import { PLAYER_NODE_CONFIG, CROSSFADE_NODE_DEFAULT, GAIN_NODE_DEFAULT } from '@/app/_lib/constants'

interface ToneNodes {
    playerA: React.RefObject<Tone.Player>
    playerB: React.RefObject<Tone.Player>
    gainA: React.RefObject<Tone.Gain>
    gainB: React.RefObject<Tone.Gain>
    crossFade: React.RefObject<Tone.CrossFade>
}

/**
 * Tone.js 오디오 노드들을 초기화하고 연결하는 커스텀 훅
 * @returns 초기화된 Tone.js 노드들의 참조를 포함하는 객체
 */
export const useToneNodes = (): ToneNodes => {
    const playerA = useRef<Tone.Player | null>(null)
    const playerB = useRef<Tone.Player | null>(null)
    const gainA = useRef<Tone.Gain | null>(null)
    const gainB = useRef<Tone.Gain | null>(null)
    const crossFade = useRef<Tone.CrossFade | null>(null)

    // store의 상태 변화 감지
    const deckASnapshot = useSnapshot(store.decks.a)
    const deckBSnapshot = useSnapshot(store.decks.b)
    const crossfadeSnap = useSnapshot(store.crossfade)

    useEffect(() => {
        // CrossFade 노드 초기화 및 출력 연결
        crossFade.current = new Tone.CrossFade(CROSSFADE_NODE_DEFAULT).toDestination()

        // Gain 노드 초기화 및 CrossFade 노드에 연결
        gainA.current = new Tone.Gain(GAIN_NODE_DEFAULT)
        gainB.current = new Tone.Gain(GAIN_NODE_DEFAULT)
        gainA.current.connect(crossFade.current.a)
        gainB.current.connect(crossFade.current.b)

        // Player 노드 초기화 및 Gain 노드에 연결
        playerA.current = new Tone.Player(PLAYER_NODE_CONFIG).connect(gainA.current)
        playerB.current = new Tone.Player(PLAYER_NODE_CONFIG).connect(gainB.current)

        // 클린업 함수
        return () => {
            playerA.current?.dispose()
            playerB.current?.dispose()
            gainA.current?.dispose()
            gainB.current?.dispose()
            crossFade.current?.dispose()
        }
    }, [])

    // 볼륨 변경 감지
    useEffect(() => {
        if (gainA.current) gainA.current.gain.value = deckASnapshot.volume
    }, [deckASnapshot.volume])

    useEffect(() => {
        if (gainB.current) gainB.current.gain.value = deckBSnapshot.volume
    }, [deckBSnapshot.volume])

    // 재생 상태 변경 감지
    useEffect(() => {
        if (!playerA.current) return

        if (deckASnapshot.isPlaying) {
            playerA.current.start(undefined, deckASnapshot.playPosition)
        } else {
            playerA.current.stop()
        }
    }, [deckASnapshot.isPlaying])

    useEffect(() => {
        if (!playerB.current) return

        if (deckBSnapshot.isPlaying) {
            playerB.current.start(undefined, deckBSnapshot.playPosition)
        } else {
            playerB.current.stop()
        }
    }, [deckBSnapshot.isPlaying])

    // 크로스페이더 값 변경 감지
    useEffect(() => {
        if (crossFade.current) {
            crossFade.current.fade.value = crossfadeSnap.value
        }
    }, [crossfadeSnap.value])

    // 재생 위치 업데이트
    useEffect(() => {
        const updatePositions = setInterval(() => {
            if (playerA.current && deckASnapshot.isPlaying) {
                store.decks.a.playPosition = playerA.current.now()
            }
            if (playerB.current && deckBSnapshot.isPlaying) {
                store.decks.b.playPosition = playerB.current.now()
            }
        }, 100)

        return () => clearInterval(updatePositions)
    }, [deckASnapshot.isPlaying, deckBSnapshot.isPlaying])

    // Deck A 트랙 로드 감지 및 처리
    useEffect(() => {
        const loadTrackToDeck = async () => {
            const player = playerA.current
            const deckState = store.decks.a

            if (!player || !deckState.currentTrack) return

            try {
                await player.load(deckState.currentTrack.url)
                store.decks.a.currentTrack = {
                    ...deckState.currentTrack,
                    duration: player.buffer.duration,
                }
                store.decks.a.playPosition = 0
                store.decks.a.isPlaying = false
            } catch (error) {
                console.error('Deck A 오디오 파일 로드 실패:', error)
            }
        }

        if (deckASnapshot.currentTrack?.url) {
            loadTrackToDeck()
        }
    }, [deckASnapshot.currentTrack?.url])

    // Deck B 트랙 로드 감지 및 처리
    useEffect(() => {
        const loadTrackToDeck = async () => {
            const player = playerB.current
            const deckState = store.decks.b

            if (!player || !deckState.currentTrack) return

            try {
                await player.load(deckState.currentTrack.url)
                store.decks.b.currentTrack = {
                    ...deckState.currentTrack,
                    duration: player.buffer.duration,
                }
                store.decks.b.playPosition = 0
                store.decks.b.isPlaying = false
            } catch (error) {
                console.error('Deck B 오디오 파일 로드 실패:', error)
            }
        }

        if (deckBSnapshot.currentTrack?.url) {
            loadTrackToDeck()
        }
    }, [deckBSnapshot.currentTrack?.url])

    return {
        playerA,
        playerB,
        gainA,
        gainB,
        crossFade,
    }
}
