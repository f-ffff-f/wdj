import React from 'react'
import { InputFile } from '@/components/ui/inputFile'
import { useTrack } from '@/app/_lib/hooks/useTrack'

const FileUploader = () => {
    const { createTrack } = useTrack()
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                createTrack(file)
            })
        }
    }
    return <InputFile type="file" accept="audio/mp3" onChange={(e) => handleFileUpload(e)} id="file-uploader" />
}

export default FileUploader
