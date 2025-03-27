'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { signOut as nextAuthSignOut } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const SignoutButton = () => {
    const queryClient = useQueryClient()
    const signOutMutation = useMutation({
        mutationFn: async () => {
            await nextAuthSignOut()
        },
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['api'] })
        },
    })
    return <Button onClick={() => signOutMutation.mutate()}>Logout</Button>
}

export default SignoutButton
