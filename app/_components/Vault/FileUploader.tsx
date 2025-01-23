import { store } from '@/app/_lib/store'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { InputFile } from '@/components/ui/inputFile'
const FileUploader = () => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                store.vault.UI.focusedId = trackId
            })
        }
    }
    return <InputFile type="file" accept="audio/mp3" onChange={(e) => handleFileUpload(e)} id="file-uploader" />
}

export default FileUploader
