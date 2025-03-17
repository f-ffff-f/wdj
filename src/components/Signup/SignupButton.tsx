'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/lib/client/hooks/useCurrentUser'

export const SignupButton = () => {
    const { data: user, isLoading } = useCurrentUser()
    const [mounted, setMounted] = useState(false)

    // Only render on client side
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || isLoading) {
        return null
    }

    // Show signup button only for guest users (not members)
    const isGuest = user?.role === 'GUEST'
    const isMember = user?.role === 'MEMBER'

    if (isGuest && !isMember) {
        return (
            <Button asChild variant="outline" size="sm">
                <Link href="/signup">Sign Up</Link>
            </Button>
        )
    }

    return null
}
