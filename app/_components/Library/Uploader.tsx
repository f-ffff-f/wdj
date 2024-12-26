import React from 'react'
import { controlState } from '@/app/_lib/controlState'

const LibraryUploader: React.FC = () => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                const audioURL = URL.createObjectURL(file)
                const newTrack = {
                    id: file.name,
                    title: file.name,
                    artist: 'Unknown',
                    duration: 0, // 추후 업데이트 예정
                    url: audioURL,
                }
                controlState.library.push(newTrack)
            })
        }
    }

    return (
        <div className="library-uploader">
            <input type="file" accept="audio/*" multiple onChange={handleFileChange} />
        </div>
    )
}

export default LibraryUploader
