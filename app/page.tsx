'use client'

import Debugger from '@/app/_components/Debugger'
import DJController from '@/app/_components/DJController'

const Home = () => {
    return (
        <div>
            <DJController />
            {process.env.NODE_ENV === 'development' && <Debugger />}
        </div>
    )
}

export default Home
