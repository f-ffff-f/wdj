'use client'

import { Button } from '@/lib/client/components/ui/button'
import React from 'react'
import { signOut } from 'next-auth/react'

const SignoutButton = () => {
    return (
        <Button onClick={() => signOut()} data-testid="signout-button">
            Sign Out
        </Button>
    )
}

export default SignoutButton
