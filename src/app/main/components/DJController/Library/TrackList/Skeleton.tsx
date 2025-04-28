'use client'

import { Card } from '@/lib/client/components/ui/card'

const Skeleton = () => {
    return (
        <div className="flex animate-pulse">
            <Card className="w-full h-[70px] relative flex items-center justify-between p-4 pr-6 shadow-none bg-secondary dark:bg-inherit" />
        </div>
    )
}

export default Skeleton
