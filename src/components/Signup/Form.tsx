'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/client/hooks/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EmailSchema, PasswordSchema } from '@/lib/shared/validations/userSchemas'

// Signup form schema definition
const signupSchema = z
    .object({
        email: EmailSchema,
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type SignupFormValues = z.infer<typeof signupSchema>

export const SignupForm = () => {
    const router = useRouter()
    const { login } = useAuth()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // React Hook Form setup
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    // Signup form submission handler
    const onSubmit = async (values: SignupFormValues) => {
        try {
            setIsPending(true)
            setError(null)

            // First create the user
            const response = await fetch('/api/user/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create account')
            }

            // Then login with the new credentials
            await login(values.email, values.password)

            // Redirect to home after successful signup and login
            router.push('/')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during signup')
            console.error('Signup error:', err)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <h2 className="text-xl font-semibold">Enter User Information</h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="example@example.com"
                                            type="email"
                                            autoComplete="email"
                                            disabled={isPending}
                                            {...field}
                                        />
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="********"
                                            type="password"
                                            autoComplete="new-password"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="********"
                                            type="password"
                                            autoComplete="new-password"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <div className="text-red-500 text-sm font-medium">{form.formState.errors.root.message}</div>
                        )}

                        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Processing...' : 'Sign Up'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/')}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
