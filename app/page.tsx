'use client'

import dynamic from 'next/dynamic'

const Debugger = dynamic(() => import('@/app/_components/Debugger'), { ssr: false })
const KeyboardController = dynamic(() => import('@/app/_components/KeyboardContoller'), { ssr: false })
const DJController = dynamic(() => import('@/app/_components/DJController'), { ssr: false })

const Home = () => {
    return (
        <div>
            <DJController />
            <KeyboardController />
            {process.env.NODE_ENV === 'development' && <Debugger />}
        </div>
    )
}

export default Home
