import React from 'react'
import { InputFile } from '@/lib/client/components/ui/inputFile'
import { useTrackMutation } from '@/lib/client/hooks/useTrackMutaion'
import { Label } from '@/lib/client/components/ui/label'

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
            <Label className="self-start" htmlFor="file-uploader">
                add audio file
            </Label>
            <InputFile
                type="file"
                accept="audio/mp3"
                onChange={(e) => handleFileUpload(e)}
                id="file-uploader"
                disabled={createTrackMutation.isPending}
            />
        </div>
    )
}

export default React.memo(FileUploader)
