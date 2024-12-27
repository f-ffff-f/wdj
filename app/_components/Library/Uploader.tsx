import React from 'react'

const LibraryUploader: React.FC<{ handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({
    handleFileChange,
}) => {
    return (
        <div className="library-uploader">
            <input type="file" accept="audio/*" multiple onChange={handleFileChange} />
        </div>
    )
}

export default LibraryUploader
