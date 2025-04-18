'use client'

import DJController from '@/app/main/components/DJController'
import Debugger from '@/lib/client/components/utils/Debugger'
import Shortcuts from '@/lib/client/components/utils/Shortcuts'
import WindowCheck from '@/lib/client/components/utils/WindowCheck'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import { ContextDeckoProvider } from '@ghr95223/decko'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <WindowCheck>
            <ContextDeckoProvider>
                {/* <Shortcuts> */}
                <DJController>{children}</DJController>
                {/* </Shortcuts> */}
            </ContextDeckoProvider>
        </WindowCheck>
    )
}

export default layout
