import { Loader } from 'lucide-react'
import React from 'react'

const MyLoader = () => {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader className="h-4 w-4 animate-spin" />
        </div>
    )
}

export default MyLoader
