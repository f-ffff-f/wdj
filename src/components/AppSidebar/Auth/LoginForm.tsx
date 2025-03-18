'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/lib/client/hooks/useLoginMutation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { LoginSchema } from '@/lib/shared/validations/userSchemas'

type LoginFormValues = z.infer<typeof LoginSchema>

const LoginForm = () => {
    const { mutate, isPending } = useLoginMutation((data) => {})

    const onSubmit = (data: LoginFormValues) => {
        mutate(data)
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
                <div className="flex justify-between">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button asChild variant="link" size="sm">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default LoginForm
