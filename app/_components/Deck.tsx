import React from 'react'
import { useSnapshot } from 'valtio'
import { deckState } from '@/app/_lib/deckState'
import FileUploader from '@/app/_components/FileUploader'

interface DeckProps {
    deckNumber: 1 | 2
}

const Deck: React.FC<DeckProps> = ({ deckNumber }) => {
    const deck = deckNumber === 1 ? deckState.deck1 : deckState.deck2
    const snap = useSnapshot(deck)

    const handleFileSelect = (file: File) => {
        // 여기에 오디오 파일을 데크에 로드하는 로직을 구현하세요
        console.log(`Deck ${deckNumber}에 선택된 파일:`, file)
        // 예시로 현재 트랙을 파일 정보로 설정
        deck.currentTrack = {
            id: file.name,
            title: file.name,
            artist: 'Unknown',
            duration: 0, // 오디오 라이브러리를 사용해 재생 시간을 추출할 수 있습니다.
        }
        deck.playPosition = 0
        deck.isPlaying = false
    }

    const handlePlayPause = () => {
        deck.isPlaying = !deck.isPlaying
    }

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        deck.volume = parseFloat(event.target.value)
    }

    return (
        <div>
            <h2>Deck {deckNumber}</h2>
            <div>
                <p>트랙: {snap.currentTrack ? snap.currentTrack.title : '없음'}</p>
                <p>재생 위치: {snap.playPosition}s</p>
                <p>볼륨: {snap.volume}</p>
                <button onClick={handlePlayPause}>{snap.isPlaying ? '일시정지' : '재생'}</button>
                <input type="range" min="0" max="1" step="0.01" value={snap.volume} onChange={handleVolumeChange} />
                <FileUploader onFileSelect={handleFileSelect} />
            </div>
        </div>
    )
}

export default Deck
