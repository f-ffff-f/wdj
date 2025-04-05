import * as React from 'react'

import { cn } from '@/lib/client/utils'
import { Loader2 } from 'lucide-react'

const MyLoaderIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<'svg'>>(({ className, ...props }, ref) => {
    return <Loader2 className={cn('animate-spin text-secondary', className)} ref={ref} {...props} />
})
MyLoaderIcon.displayName = 'MyLoaderIcon'

export default MyLoaderIcon
