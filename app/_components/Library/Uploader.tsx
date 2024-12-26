import React from 'react'
import { store } from '@/app/_lib/store'
import { v4 as uuidv4 } from 'uuid'

const LibraryUploader: React.FC = () => {
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

    return (
        <div className="library-uploader">
            <input type="file" accept="audio/*" multiple onChange={handleFileChange} />
        </div>
    )
}

export default LibraryUploader
