import DJController from '@/app/main/components/DJController'
import Debugger from '@/lib/client/components/utils/Debugger'
import Shortcuts from '@/lib/client/components/utils/Shortcuts'
import WindowCheck from '@/lib/client/components/utils/WindowCheck'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import React from 'react'

const layout = async ({ children }: { children: React.ReactNode }) => {
    const { isMobileDevice } = await detectMobileDevice()
    return (
        <WindowCheck>
            {isMobileDevice ? <DJController>{children}</DJController> : <DJController>{children}</DJController>}
            {process.env.NODE_ENV === 'development' && <Debugger />}
        </WindowCheck>
    )
}

export default layout
