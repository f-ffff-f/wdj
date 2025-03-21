'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { SigninSchema } from '@/lib/shared/validations/userSchemas'
import { useState } from 'react'
import { useGuestMutation } from '@/lib/client/hooks/useGuestMutation'
import TurnstileWidget from '@/lib/client/components/TurnstileWidget'

const SigninForm = () => {
    const { signInMutation } = useAuth()
    const { createGuestAndSignInMutation } = useGuestMutation()
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [remountKey, setRemountKey] = useState(0)

    const handleSignIn = async (data: z.infer<typeof SigninSchema>) => {
        try {
            await signInMutation.mutateAsync(data)
        } catch (error) {
            setRemountKey((prev) => prev + 1) // Force remount of Turnstile widget
        }
    }

    const handleGuestSignIn = async () => {
        try {
            await createGuestAndSignInMutation.mutateAsync({ token: turnstileToken })
        } catch (error) {
            setRemountKey((prev) => prev + 1) // Force remount of Turnstile widget
        }
    }

    const form = useForm<z.infer<typeof SigninSchema>>({
        resolver: zodResolver(SigninSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                <fieldset disabled={!turnstileToken || signInMutation.isPending}>
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
                    <div className="flex flex-col gap-1">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                        <div className="flex flex-col items-end gap-2">
                            <Button type="button" variant="link" size="sm" onClick={handleGuestSignIn}>
                                Continue as Guest
                            </Button>
                            <Button variant="link" size="sm">
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </div>
                    </div>

                    <TurnstileWidget onTokenChange={setTurnstileToken} resetTrigger={remountKey} />
                </fieldset>
            </form>
        </Form>
    )
}

export default SigninForm
