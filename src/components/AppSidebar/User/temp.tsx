'use client'

import { Button } from '@/components/ui/button'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import React from 'react'

const SignOutButton = () => {
    const { signOutMutation } = useClientAuth()

    return <Button onClick={() => signOutMutation.mutate()}>Logout</Button>
}

export default SignOutButton
