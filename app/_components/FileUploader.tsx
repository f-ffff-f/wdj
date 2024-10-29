import React from 'react'

interface IFileUploaderProps {
    onFileSelect: (file: File) => void
}

const FileUploader: React.FC<IFileUploaderProps> = ({ onFileSelect }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileSelect(event.target.files[0])
        }
    }

    return (
        <div className="file-uploader">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
        </div>
    )
}

export default FileUploader
