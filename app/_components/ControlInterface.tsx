import CrossFader from '@/app/_components/CrossFader'
import Deck from '@/app/_components/Deck'
import LibraryList from '@/app/_components/Library/List'
import LibraryUploader from '@/app/_components/Library/Uploader'
import { useAudioContext } from '@/app/_hooks/useAudioContext'
import { DECK_IDS } from '@/app/_lib/constants'
import React from 'react'

const ControlInterface = () => {
    const { audioContext, initializeContext } = useAudioContext()

    return (
        <div>
            {!audioContext ? (
                <button onClick={initializeContext}>초기화</button>
            ) : (
                <>
                    <div className="flex flex-wrap justify-center gap-8 mb-8">
                        {DECK_IDS.map((id) => (
                            <Deck key={id} id={id} />
                        ))}
                    </div>
                    <CrossFader />
                    <div className="mt-8">
                        <LibraryUploader />
                        <LibraryList />
                    </div>
                </>
            )}
        </div>
    )
}

export default ControlInterface
