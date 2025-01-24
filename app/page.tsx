'use client'

import dynamic from 'next/dynamic'

const Debugger = dynamic(() => import('@/app/_components/Debugger'), { ssr: false })
const Shortcuts = dynamic(() => import('@/app/_components/Shortcuts'), { ssr: false })
const DJController = dynamic(() => import('@/app/_components/DJController'), { ssr: false })

const Home = () => {
    return (
        <div>
            <Shortcuts>
                <DJController />
            </Shortcuts>
            {process.env.NODE_ENV === 'development' && <Debugger />}
        </div>
    )
}

export default Home
