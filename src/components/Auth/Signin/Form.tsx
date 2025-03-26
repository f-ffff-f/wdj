/** @deprecated */
'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useClientAuth } from '@/lib/client/hooks/useClientAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { MemberSigninSchema } from '@/lib/shared/validations/userSchemas'
import { useState } from 'react'
import { useGuestMutation } from '@/lib/client/hooks/useGuestMutation'
import TurnstileWidget from '@/lib/client/components/TurnstileWidget'

const SigninForm = () => {
    const { signInMutation } = useClientAuth()
    const { createGuestAndSignInMutation } = useGuestMutation(async (data, variables) => {
        await signInMutation.mutateAsync({
            guestUserId: data.id,
            token: variables.token,
        })
    })
    const [remountKey, setRemountKey] = useState(0)

    const form = useForm<z.infer<typeof MemberSigninSchema>>({
        resolver: zodResolver(MemberSigninSchema),
        defaultValues: {
            email: '',
            password: '',
            token: '',
        },
    })

    const { watch } = form
    const token = watch('token')

    const handleSignIn = async (data: z.infer<typeof MemberSigninSchema>) => {
        try {
            await signInMutation.mutateAsync({
                email: data.email,
                password: data.password,
                token: data.token,
            })
        } catch {
            setRemountKey((prev) => prev + 1)
            form.setValue('token', '')
        }
    }

    const handleGuestSignIn = async () => {
        const currentToken = form.getValues('token')
        if (!currentToken) return

        try {
            await createGuestAndSignInMutation.mutateAsync({ token: currentToken })
        } catch {
            setRemountKey((prev) => prev + 1)
            form.setValue('token', '')
        }
    }

    const handleTokenChange = (newToken: string) => {
        form.setValue('token', newToken)
    }
    const isPending = signInMutation.isPending || createGuestAndSignInMutation.isPending

    return (
        <div className="max-w-md m-auto p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                    <fieldset disabled={!token || isPending}>
                        <div className="flex flex-col gap-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Button type="button" variant="link" size="sm" onClick={handleGuestSignIn}>
                                Continue as Guest
                            </Button>
                            <Button variant="link" size="sm">
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>

                        <TurnstileWidget onTokenChange={handleTokenChange} resetTrigger={remountKey} />
                    </fieldset>
                </form>
            </Form>
        </div>
    )
}

export default SigninForm
