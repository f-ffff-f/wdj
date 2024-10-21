'use client'

import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    return (
        <div>
            Template {pathName} {children}
        </div>
    )
}
