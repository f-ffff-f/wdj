'use client'
import React from 'react'
import { Loader2 } from 'lucide-react'
const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
}

export default Loader
