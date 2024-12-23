import React, { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { controlState, IDeckState } from '@/app/_lib/controlState'
import FileUploader from '@/app/_components/FileUploader'
import Crossfader from '@/app/_components/Crossfader'
import * as Tone from 'tone'
import { AUDIO_DEFAULTS, PLAYER_CONFIG, CROSSFADER_CONFIG } from '@/app/_lib/constants'

const ControlInterface = () => {
    const deckAState = controlState.decks.a
    const deckBState = controlState.decks.b
    const deckASnapshot = useSnapshot(deckAState)
    const deckBSnapshot = useSnapshot(deckBState)

    // Tone.js 노드 참조 저장
    const playerA = React.useRef<Tone.Player | null>(null)
    const playerB = React.useRef<Tone.Player | null>(null)
    const gainA = React.useRef<Tone.Gain | null>(null)
    const gainB = React.useRef<Tone.Gain | null>(null)
    const crossFade = React.useRef<Tone.CrossFade | null>(null)

    // Deck 설정 정의
    const decks = [
        {
            id: 'a',
            title: 'Deck A',
            state: deckAState,
            snapshot: deckASnapshot,
            player: playerA,
            gain: gainA,
        },
        {
            id: 'b',
            title: 'Deck B',
            state: deckBState,
            snapshot: deckBSnapshot,
            player: playerB,
            gain: gainB,
        },
    ] as const

    React.useEffect(() => {
        // CrossFade 노드 초기화
        crossFade.current = new Tone.CrossFade(CROSSFADER_CONFIG.DEFAULT).toDestination()

        // Gain 노드 초기화 및 CrossFade에 연결
        gainA.current = new Tone.Gain(AUDIO_DEFAULTS.volume)
        gainB.current = new Tone.Gain(AUDIO_DEFAULTS.volume)
        gainA.current.connect(crossFade.current.a)
        gainB.current.connect(crossFade.current.b)

        // Player 초기화 및 Gain 노드에 연결
        playerA.current = new Tone.Player(PLAYER_CONFIG).connect(gainA.current)
        playerB.current = new Tone.Player(PLAYER_CONFIG).connect(gainB.current)

        // 클린업
        return () => {
            playerA.current?.dispose()
            playerB.current?.dispose()
            gainA.current?.dispose()
            gainB.current?.dispose()
            crossFade.current?.dispose()
        }
    }, [])

    const handleVolumeChange =
        (deckState: IDeckState, gainNode: React.RefObject<Tone.Gain>) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newVolume = parseFloat(event.target.value)
            deckState.volume = newVolume
            if (gainNode.current) {
                gainNode.current.gain.value = newVolume
            }
        }

    const handleFileSelect = (deckState: IDeckState, player: React.RefObject<Tone.Player>) => async (file: File) => {
        try {
            const audioURL = URL.createObjectURL(file)

            if (player.current) {
                await player.current.load(audioURL)

                // 파일 정보 업데이트
                deckState.currentTrack = {
                    id: file.name,
                    title: file.name,
                    artist: 'Unknown',
                    duration: player.current.buffer.duration,
                }
                deckState.playPosition = 0
                deckState.isPlaying = false

                console.log('오디오 파일 로드 완료:', {
                    name: file.name,
                    duration: player.current.buffer.duration,
                })
            }
        } catch (error) {
            console.error('오디오 파일 로드 실패:', error)
        }
    }

    const handlePlayPause = (deckState: IDeckState, player: React.RefObject<Tone.Player>) => async () => {
        try {
            if (player.current) {
                if (deckState.isPlaying) {
                    player.current.stop()
                } else {
                    // 현재 위치에서 재생 시작
                    player.current.start(undefined, deckState.playPosition)
                }
                deckState.isPlaying = !deckState.isPlaying
            }
        } catch (error) {
            console.error('재생/정지 중 오류 발생:', error)
        }
    }

    // 재생 위치 업데이트
    useEffect(() => {
        const updatePositions = setInterval(() => {
            if (playerA.current && deckAState.isPlaying) {
                deckAState.playPosition = playerA.current.now()
            }
            if (playerB.current && deckBState.isPlaying) {
                deckBState.playPosition = playerB.current.now()
            }
        }, 100)

        return () => clearInterval(updatePositions)
    }, [deckAState, deckBState])

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {decks.map(({ id, title, state, snapshot, player, gain }) => (
                    <div key={id} className="p-4 border rounded-lg">
                        <h2 className="text-xl font-bold mb-4">{title}</h2>
                        <div className="space-y-4">
                            <FileUploader onFileSelect={handleFileSelect(state, player)} />
                            <p>트랙: {snapshot.currentTrack ? snapshot.currentTrack.title : '없음'}</p>
                            <p>길이: {snapshot.currentTrack?.duration.toFixed(2) || 0}초</p>
                            <p>재생 위치: {snapshot.playPosition.toFixed(2)}s</p>
                            <div className="space-y-2">
                                <p>볼륨: {snapshot.volume.toFixed(2)}</p>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={snapshot.volume}
                                    onChange={handleVolumeChange(state, gain)}
                                    className="w-full"
                                />
                            </div>
                            <button
                                onClick={handlePlayPause(state, player)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                {snapshot.isPlaying ? '정지' : '재생'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Crossfader crossFadeRef={crossFade} />
        </div>
    )
}

export default ControlInterface
