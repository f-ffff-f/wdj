import React from 'react'
import { InputFile } from '@/components/ui/inputFile'
import { useTrack } from '@/lib/client/hooks/useTrack'
import { LoaderCircle } from 'lucide-react'

const FileUploader = () => {
    const { createTrack, isCreating } = useTrack()
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                createTrack(file)
            })
        }
    }
    return (
        <div>
            {isCreating ? (
                <div className="flex items-center justify-center">
                    <LoaderCircle className="animate-spin" />
                </div>
            ) : (
                <InputFile type="file" accept="audio/mp3" onChange={(e) => handleFileUpload(e)} id="file-uploader" />
            )}
        </div>
    )
}

export default FileUploader
