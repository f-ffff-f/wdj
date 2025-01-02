import CrossFader from '@/app/_components/CrossFader'
import Deck from '@/app/_components/Deck'
import LibraryList from '@/app/_components/Library/List'
import LibraryUploader from '@/app/_components/Library/Uploader'
import { useToneNodes } from '@/app/_hooks/useToneNodes'
import { DECK_IDS } from '@/app/_lib/constants'
import { store } from '@/app/_lib/store'
import { ITrack, TDeckIds } from '@/app/_lib/types'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ControlInterface = () => {
    const [isInteracting, setIsInteracting] = useState(false)
    useToneNodes(isInteracting)

    const handleVolumeChange = (id: TDeckIds[number]) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value)
        store.controller.decks[id].volume = newVolume
    }

    /**
     * 재생/정지 토글을 처리하는 핸들러
     */
    const handlePlayPause = (id: TDeckIds[number]) => async () => {
        try {
            store.controller.decks[id].isPlaying = !store.controller.decks[id].isPlaying
        } catch (error) {
            console.error('재생/정지 중 오류 발생:', error)
        }
    }

    const handleCrossFade = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value)
        store.controller.crossfade.value = value
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                const trackId = uuidv4()
                const audioURL = URL.createObjectURL(file)
                const newTrack = {
                    id: trackId,
                    fileName: file.name,
                    duration: 0,
                    url: audioURL,
                }
                store.vault.library.push(newTrack)
            })
        }
    }
    const handleLoadToDeck = (track: ITrack) => (deckId: 'a' | 'b') => {
        // store 상태만 업데이트. useToneNodes에서 이 변경을 감지하여 처리
        store.controller.decks[deckId].currentTrack = {
            ...track,
            duration: 0, // 실제 duration은 로드 완료 후 useToneNodes에서 업데이트
        }
    }

    return (
        <div onClick={() => setIsInteracting(true)}>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
                {DECK_IDS.map((id) => (
                    <Deck
                        key={id}
                        id={id}
                        handleVolumeChange={handleVolumeChange(id)}
                        handlePlayPause={handlePlayPause(id)}
                    />
                ))}
            </div>
            <CrossFader handleCrossFade={handleCrossFade} />
            <div className="mt-8">
                <LibraryUploader handleFileChange={handleFileChange} />
                <LibraryList handleLoadToDeck={handleLoadToDeck} />
            </div>
        </div>
    )
}

export default ControlInterface
