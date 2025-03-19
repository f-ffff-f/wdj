'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { LoginSchema } from '@/lib/shared/validations/userSchemas'

type LoginFormValues = z.infer<typeof LoginSchema>

const LoginForm = () => {
    const { login, loginAsGuest } = useAuth()
    const [isPending, setIsPending] = useState(false)

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsPending(true)
            await login(data.email, data.password)
        } catch (error) {
            console.error('Login error:', error)
            // Handle errors appropriately
        } finally {
            setIsPending(false)
        }
    }

    const handleGuestLogin = async () => {
        try {
            setIsPending(true)
            await loginAsGuest()
        } catch (error) {
            console.error('Guest login error:', error)
        } finally {
            setIsPending(false)
        }
    }

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>email</FormLabel>
                            <FormControl>
                                <Input type="email" disabled={isPending} {...field} />
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
                                <Input type="password" disabled={isPending} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Login'}
                    </Button>
                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGuestLogin}
                            disabled={isPending}
                        >
                            Continue as Guest
                        </Button>
                        <Button asChild variant="link" size="sm">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default LoginForm
