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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Add TypeScript declarations for Turnstile
declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileOptions) => string
            reset: (widgetId: string) => void
        }
        _cbTurnstile: (token: string) => void
    }
}

interface TurnstileOptions {
    sitekey: string
    callback: (token: string) => void
    'refresh-expired'?: string
    theme?: 'light' | 'dark'
    size?: 'normal' | 'compact'
}

// Generic type for auth functions that accept params and optional token
type AuthFunction<T> = (params: T, token?: string) => Promise<unknown>

const SigninForm = () => {
    const { signIn, signInAsGuest } = useAuth()
    const router = useRouter()
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [widgetId, setWidgetId] = useState<string | null>(null)
    const [remountKey, setRemountKey] = useState(0)

    /**
     * Renders the Turnstile widget when the component mounts or when remountKey changes
     */
    useEffect(() => {
        // Define callback function for Turnstile
        window._cbTurnstile = (token: string) => {
            setTurnstileToken(token)
        }

        // Small delay to ensure the DOM is ready
        const timeoutId = setTimeout(() => {
            const container = document.querySelector('.cf-turnstile') as HTMLElement

            if (window.turnstile && container) {
                // If we have a previous widget ID, reset it first
                if (widgetId) {
                    window.turnstile.reset(widgetId)
                }

                // Render a new widget
                const newWidgetId = window.turnstile.render(container, {
                    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
                    callback: (token: string) => {
                        setTurnstileToken(token)
                    },
                    theme: 'dark',
                })

                setWidgetId(newWidgetId)
            }
        }, 100)

        return () => {
            clearTimeout(timeoutId)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remountKey])

    /**
     * Verifies turnstile token and executes authentication function if verification succeeds
     */
    const verifyAndExecute = async <T,>(authFunction: AuthFunction<T>, params: T) => {
        try {
            if (!turnstileToken) {
                alert('Please complete the CAPTCHA verification')
                return
            }

            // First verify the turnstile token
            const verifyResponse = await fetch('/api/turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: turnstileToken }),
            })

            const verifyResult = await verifyResponse.json()

            if (!verifyResult.success) {
                alert('CAPTCHA verification failed. Please try again.')
                setRemountKey((prev) => prev + 1) // Force remount of Turnstile widget
                return
            }

            // If verification successful, proceed with authentication
            await authFunction(params, turnstileToken)
            router.push('/main')
        } catch (error) {
            alert(error)
            setRemountKey((prev) => prev + 1) // Force remount of Turnstile widget
        }
    }

    const handleSignIn = async (data: z.infer<typeof SigninSchema>) => {
        await verifyAndExecute(signIn, data)
    }

    const handleGuestSignIn = async () => {
        await verifyAndExecute(signInAsGuest as AuthFunction<void>, undefined)
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
                <fieldset disabled={!turnstileToken}>
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

                    {/* Turnstile widget container with key for forced remount */}
                    <div key={remountKey} className="cf-turnstile mt-4" />
                </fieldset>
            </form>
        </Form>
    )
}

export default SigninForm
