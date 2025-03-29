import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export const detectMobileDevice = async () => {
    const userAgent = (await headers()).get('user-agent') || ''
    const device = new UAParser(userAgent).getDevice()
    return { isMobileDevice: device.type === 'mobile' }
}
