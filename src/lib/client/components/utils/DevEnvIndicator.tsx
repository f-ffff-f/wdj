import React from 'react'

export const DevEnvIndicator = () => {
    if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'main') return null

    return (
        <div className="fixed top-2 right-2 z-[9999] flex items-center gap-2">
            <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">DEVELOPMENT</div>
            <div className="rounded-md bg-foreground px-2 py-1 text-xs font-bold text-background">
                {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ? 'preview' : 'local'}
            </div>
        </div>
    )
}
