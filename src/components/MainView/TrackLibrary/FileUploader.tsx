import React from 'react'
import { InputFile } from '@/components/ui/inputFile'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import MyLoaderIcon from '@/components/ui/myLoaderIcon'
const FileUploader = () => {
    const { createTrackMutation } = useTrackMutation()
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            files.forEach((file) => {
                createTrackMutation.mutate(file)
            })
        }
    }
    return (
        <div>
            {createTrackMutation.isPending ? (
                <div className="flex items-center justify-center">
                    <MyLoaderIcon />
                </div>
            ) : (
                <InputFile type="file" accept="audio/mp3" onChange={(e) => handleFileUpload(e)} id="file-uploader" />
            )}
        </div>
    )
}

export default FileUploader
