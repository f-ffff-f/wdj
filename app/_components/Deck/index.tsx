import { store } from '@/app/_lib/store'
import { IDeck, TDeckIds } from '@/app/_lib/types'
import { useSnapshot } from 'valtio'

interface DeckProps {
    /**
     * 데크의 고유 식별자 ('a' | 'b')
     */
    id: TDeckIds[number]
    handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handlePlayPause: () => void
}

/**
 * 개별 데크를 표시하고 제어하는 컴포넌트
 * 볼륨 조절, 재생/정지 기능을 제공합니다.
 */
const Deck = ({ id, handleVolumeChange, handlePlayPause }: DeckProps) => {
    const snapshot = useSnapshot(store)

    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">{id}</h2>
            <div className="space-y-4">
                <p>
                    트랙:{' '}
                    {snapshot.controller.decks[id].currentTrack
                        ? snapshot.controller.decks[id].currentTrack.fileName
                        : '없음'}
                </p>
                <p>길이: {snapshot.controller.decks[id].currentTrack?.duration.toFixed(2) || 0}초</p>
                <p>재생 위치: {snapshot.controller.decks[id].playPosition.toFixed(2)}초</p>
                <div className="space-y-2">
                    <p>볼륨: {snapshot.controller.decks[id].volume.toFixed(2)}</p>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={snapshot.controller.decks[id].volume}
                        onChange={handleVolumeChange}
                        className="w-full"
                    />
                </div>
                <button
                    onClick={handlePlayPause}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {snapshot.controller.decks[id].isPlaying ? '정지' : '재생'}
                </button>
            </div>
        </div>
    )
}

export default Deck
