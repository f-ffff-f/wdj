import { addTrack } from '@/app/_lib/state'
import React from 'react'
import { InputFile } from '@/components/ui/inputFile'

const FileUploader = () => {
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                addTrack(file)
            })
        }
    }
    return <InputFile type="file" accept="audio/mp3" onChange={(e) => handleFileUpload(e)} id="file-uploader" />
}

export default FileUploader
