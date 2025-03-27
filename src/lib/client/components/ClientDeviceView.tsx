'use client'

import { useIsMobile } from '@/lib/client/hooks/use-mobile'

const ClientDeviceView = ({ mobile, desktop }: { mobile: React.ReactNode; desktop: React.ReactNode }) => {
    const isMobile = useIsMobile()
    return <div>{isMobile ? mobile : desktop}</div>
}

export default ClientDeviceView
