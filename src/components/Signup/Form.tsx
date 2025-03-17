'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/lib/client/hooks/useLoginMutation'
import { useSignupMutation } from '@/lib/client/hooks/useSignupMutation'
import { getGuestToken, getMemberToken, isMemberAuthenticated } from '@/lib/client/utils/tokenStorage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Signup form schema definition
const signupSchema = z
    .object({
        email: z.string().email('Please enter a valid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type SignupFormValues = z.infer<typeof signupSchema>

export const SignupForm = () => {
    const router = useRouter()

    // React Hook Form setup
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    // Login mutation will be triggered after successful signup
    const loginMutation = useLoginMutation((data) => {
        // Redirect to home after successful login
        router.push('/')
        router.refresh()
    })

    // Signup mutation
    const signupMutation = useSignupMutation(() => {
        // After successful signup, login the user
        loginMutation.mutate({
            email: form.getValues('email'),
            password: form.getValues('password'),
        })
    })

    // Check authentication state on client side
    useEffect(() => {
        // If user is a member or no guest token exists, redirect to home
        const memberToken = getMemberToken()
        const guestToken = getGuestToken()

        if (memberToken || !guestToken) {
            router.push('/')
        }
    }, [router])

    // Also redirect if user data indicates they're already a member
    useEffect(() => {
        if (isMemberAuthenticated()) {
            router.push('/')
        }
    }, [router])

    // Signup form submission handler
    const onSubmit = async (values: SignupFormValues) => {
        signupMutation.mutate({
            email: values.email,
            password: values.password,
        })
    }

    // Determine if form is in loading state
    const isLoading = signupMutation.isPending || loginMutation.isPending

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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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

                        {signupMutation.error && (
                            <div className="text-red-500 text-sm font-medium">
                                {signupMutation.error.message || 'An error occurred during signup'}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Sign Up'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/')}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}
