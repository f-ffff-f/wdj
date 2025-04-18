import DJController from '@/app/main/components/DJController'
import WindowCheck from '@/lib/client/components/utils/WindowCheck'
import React from 'react'

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <WindowCheck>
            <DJController>{children}</DJController>
        </WindowCheck>
    )
}

export default layout
