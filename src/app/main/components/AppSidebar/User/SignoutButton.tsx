'use client'

import { Button } from '@/lib/client/components/ui/button'
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
    return (
        <Button
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
            data-testid="signout-button"
        >
            Sign Out
        </Button>
    )
}

export default SignoutButton
