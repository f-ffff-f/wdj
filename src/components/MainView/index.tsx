import Shortcuts from '@/components/MainView/Shortcuts'
import Debugger from '@/lib/client/components/Debugger'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import DJController from '@/components/MainView/DJController'

const MainView = async () => {
    const { isMobileDevice } = await detectMobileDevice()

    return (
        <div>
            {/* {isMobileDevice ? ( */}
            <DJController />
            {/* ) : (
                <Shortcuts>
                    <DJController />
                    {process.env.NODE_ENV === 'development' && <Debugger />}
                </Shortcuts>
            )} */}
        </div>
    )
}

export default MainView
