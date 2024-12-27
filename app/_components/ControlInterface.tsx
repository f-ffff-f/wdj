import React, { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { store } from '@/app/_lib/store'
import LibraryUploader from '@/app/_components/Library/Uploader'
import LibraryList from '@/app/_components/Library/List'
import CrossFader from '@/app/_components/CrossFader'
import * as Tone from 'tone'
import { PLAYER_NODE_CONFIG, CROSSFADE_NODE_DEFAULT, GAIN_NODE_DEFAULT } from '@/app/_lib/constants'
import { IDeck } from '@/app/_lib/types'

const ControlInterface = () => {
    const deckAState = store.decks.a
    const deckBState = store.decks.b
    const deckASnapshot = useSnapshot(deckAState)
    const deckBSnapshot = useSnapshot(deckBState)

    const playerA = React.useRef<Tone.Player | null>(null)
    const playerB = React.useRef<Tone.Player | null>(null)
    const gainA = React.useRef<Tone.Gain | null>(null)
    const gainB = React.useRef<Tone.Gain | null>(null)
    const crossFade = React.useRef<Tone.CrossFade | null>(null)

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
        crossFade.current = new Tone.CrossFade(CROSSFADE_NODE_DEFAULT).toDestination()

        gainA.current = new Tone.Gain(GAIN_NODE_DEFAULT)
        gainB.current = new Tone.Gain(GAIN_NODE_DEFAULT)
        gainA.current.connect(crossFade.current.a)
        gainB.current.connect(crossFade.current.b)

        playerA.current = new Tone.Player(PLAYER_NODE_CONFIG).connect(gainA.current)
        playerB.current = new Tone.Player(PLAYER_NODE_CONFIG).connect(gainB.current)

        return () => {
            playerA.current?.dispose()
            playerB.current?.dispose()
            gainA.current?.dispose()
            gainB.current?.dispose()
            crossFade.current?.dispose()
        }
    }, [])

    const handleVolumeChange =
        (deckState: IDeck, gainNode: React.RefObject<Tone.Gain>) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const newVolume = parseFloat(event.target.value)
            deckState.volume = newVolume
            if (gainNode.current) {
                gainNode.current.gain.value = newVolume
            }
        }

    const handlePlayPause = (deckState: IDeck, player: React.RefObject<Tone.Player>) => async () => {
        try {
            if (player.current) {
                if (deckState.isPlaying) {
                    player.current.stop()
                } else {
                    player.current.start(undefined, deckState.playPosition)
                }
                deckState.isPlaying = !deckState.isPlaying
            }
        } catch (error) {
            console.error('재생/정지 중 오류 발생:', error)
        }
    }

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
                            <p>트랙: {snapshot.currentTrack ? snapshot.currentTrack.fileName : '없음'}</p>
                            <p>길이: {snapshot.currentTrack?.duration.toFixed(2) || 0}초</p>
                            <p>재생 위치: {snapshot.playPosition.toFixed(2)}초</p>
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
            <CrossFader crossFadeRef={crossFade} />
            <div className="mt-8">
                <LibraryUploader />
                <LibraryList playerA={playerA} playerB={playerB} />
            </div>
        </div>
    )
}

export default ControlInterface
