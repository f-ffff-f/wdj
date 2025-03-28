'use client'
import { cn } from '@/lib/client/utils'
import React from 'react'
import { Loader2 } from 'lucide-react'
const Loader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
}

export default Loader
